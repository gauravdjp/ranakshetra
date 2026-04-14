import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { parseBattleResult } from "@/app/api/clashroyale/battlelog/parsebattlelog";

export async function GET(req: NextRequest) {
  try {
    const tournamentId = req.nextUrl.searchParams.get("tournamentId");
    const matchId      = req.nextUrl.searchParams.get("matchId");
    if (!tournamentId || !matchId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("RKS");

    const bracket = await db.collection("brackets").findOne({ tournament_id: tournamentId });
    if (!bracket) return NextResponse.json({ error: "Bracket not found" }, { status: 404 });

    const match = bracket.matches.find((m: any) => m.matchId === matchId);
    if (!match || match.status !== "live") {
      return NextResponse.json({ found: false, reason: "Not live" });
    }

    // Fetch player1's battlelog from CR
    const tag = encodeURIComponent(match.player1.tag);
    const crRes = await fetch(`https://proxy.royaleapi.dev/v1/players/${tag}/battlelog`, {
      headers: { Authorization: `Bearer ${process.env.CLASH_ROYALE_API_KEY}` },
    });
    const raw = await crRes.json();
    const battles = (Array.isArray(raw) ? raw : []).map(parseBattleResult).filter(Boolean);

    // Find a battle AFTER started_at that involves player2
    const startedAt = new Date(match.started_at).getTime();
    const result = battles.find((b: any) => {
      const battleTime = new Date(b.battleEndTime).getTime();
      return (
        battleTime > startedAt &&
        (b.opponent_tag === match.player2.tag || b.team_tag === match.player2.tag)
      );
    });

    if (!result) return NextResponse.json({ found: false });

    // Determine winner player object
    const winnerTag = result.winner_tag;
    const winner = match.player1.tag === winnerTag ? match.player1 : match.player2;

    // Mark match completed + advance winner to next round
    const nextMatchId = `r${match.round + 1}m${Math.floor(match.index / 2)}`;
    const nextSlot    = match.index % 2 === 0 ? "player1" : "player2";

    // Check if next match exists (won't exist for the final)
    const nextExists = bracket.matches.some((m: any) => m.matchId === nextMatchId);

    const updateOps: any = {
      "matches.$[current].status":     "completed",
      "matches.$[current].winner_tag": winnerTag,
      updated_at: new Date().toISOString(),
    };
    if (nextExists) {
      updateOps[`matches.$[next].${nextSlot}`] = winner;
    }

    const arrayFilters: any[] = [{ "current.matchId": matchId }];
    if (nextExists) arrayFilters.push({ "next.matchId": nextMatchId });

    await db.collection("brackets").updateOne(
      { tournament_id: tournamentId },
      { $set: updateOps },
      { arrayFilters }
    );

    return NextResponse.json({ found: true, winner });
  } catch (err) {
    console.error("[poll] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}