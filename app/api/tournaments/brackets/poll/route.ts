import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { parseBattleResult } from "@/app/api/clashroyale/battlelog/parsebattlelog";

export async function GET(req: NextRequest) {
  try {
    const tournamentId = req.nextUrl.searchParams.get("tournamentId");
    const matchId = req.nextUrl.searchParams.get("matchId");

    if (!tournamentId || !matchId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("RKS");

    const bracket = await db.collection("brackets").findOne({ tournament_id: tournamentId });
    if (!bracket) return NextResponse.json({ error: "Bracket not found" }, { status: 404 });

    const match = bracket.matches.find((m: any) => m.matchId === matchId);
    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

    // 1. Already completed logic
    if (match.status === "completed") {
      return NextResponse.json({ found: true, status: "completed", winner: match.winner_tag }, { status: 200 });
    }

    // 2. Fetch battle log
    const tag = encodeURIComponent(match.player1.tag);
    const crRes = await fetch(`https://proxy.royaleapi.dev/v1/players/${tag}/battlelog`, {
      headers: { Authorization: `Bearer ${process.env.CLASH_ROYALE_API_KEY}` },
    });

    if (!crRes.ok) throw new Error(`CR API unreachable: ${crRes.status}`);

    const raw = await crRes.json();
    const battles = (Array.isArray(raw) ? raw : []).map(parseBattleResult).filter(Boolean);

    const startedAt = match.started_at instanceof Date
      ? match.started_at.getTime()
      : new Date(match.started_at).getTime();
    
    const result = battles.find((b: any) => {
      const battleTime = new Date(b.battleEndTime).getTime();
      const isAfterStart = battleTime > startedAt;
      const isCorrectOpponent = b.opponent_tag === match.player2.tag || b.team_tag === match.player2.tag;
      return isAfterStart && isCorrectOpponent;
    });

    if (!result) {
      return NextResponse.json({ found: false, matchId }, { status: 202 });
    }
    
    const winnerTag = result.winner_tag;
    const winner = match.player1.tag === winnerTag ? match.player1 : match.player2;

    // --- START ADVANCEMENT LOGIC ---
    const updateOps: Record<string, any> = {
      "matches.$[current].status": "completed",
      "matches.$[current].winner_tag": winnerTag,
      updated_at: new Date().toISOString(),
    };
    const arrayFilters: any[] = [{ "current.matchId": matchId }];

    let currentWinner = winner;
    let currentMatchId = matchId;
    let nextMatchId = match.nextMatchId || `r${match.round + 1}m${Math.floor(match.index / 2)}`;

    // BUG FIX: Bye-Handling Loop
    // This checks if the match we are moving into is a BYE. 
    // If it is, we auto-complete that one too and look for the NEXT one.
    let targetMatch = bracket.matches.find((m: any) => m.matchId === nextMatchId);
    
    while (targetMatch && targetMatch.isBye) {
      console.log(`[poll] Auto-advancing through bye match: ${targetMatch.matchId}`);
      
      // Mark the bye match as completed immediately
      updateOps[`matches.$[bye${targetMatch.matchId}].status`] = "completed";
      updateOps[`matches.$[bye${targetMatch.matchId}].winner_tag`] = currentWinner.tag;
      updateOps[`matches.$[bye${targetMatch.matchId}].player1`] = currentWinner;
      
      arrayFilters.push({ [`bye${targetMatch.matchId}.matchId`]: targetMatch.matchId });

      // Move to the next level
      const nextId: string = targetMatch.nextMatchId || `r${targetMatch.round + 1}m${Math.floor(targetMatch.index / 2)}`;
      targetMatch = bracket.matches.find((m: any) => m.matchId === nextId);
      nextMatchId = nextId;
    }

    // Finally, place the winner in the first non-bye (or null) match found
    if (targetMatch) {
      const slot = (bracket.matches.find((m: any) => m.matchId === currentMatchId)?.index || 0) % 2 === 0 ? "player1" : "player2";
      updateOps[`matches.$[next].${slot}`] = currentWinner;
      arrayFilters.push({ "next.matchId": targetMatch.matchId });
    }

    await db.collection("brackets").updateOne(
      { tournament_id: tournamentId },
      { $set: updateOps },
      { arrayFilters }
    );

    return NextResponse.json({ found: true, matchId, winner, result }, { status: 200 });

  } catch (err) {
    console.error("[poll] error:", err);
    return NextResponse.json({ error: "Failed to poll", details: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}