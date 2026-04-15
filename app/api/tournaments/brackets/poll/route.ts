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
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    console.log("[poll] p1 tag from DB:", JSON.stringify(match.player1.tag));
    console.log("[poll] p2 tag from DB:", JSON.stringify(match.player2.tag));
    console.log("[poll] encoded p1 tag:", encodeURIComponent(match.player1.tag));

    // 1. Already completed — stop polling immediately
    if (match.status === "completed") {
      console.log(`[poll] Match ${matchId} already completed, winner: ${match.winner_tag}`);
      return NextResponse.json(
        { found: true, status: "completed", winner: match.winner_tag },
        { status: 200 }
      );
    }

    // 2. Fetch battle log from CR API (use player1's tag)
    const tag = encodeURIComponent(match.player1.tag);
    console.log(tag)
    const crRes = await fetch(`https://proxy.royaleapi.dev/v1/players/${tag}/battlelog`, {
      headers: { Authorization: `Bearer ${process.env.CLASH_ROYALE_API_KEY}` },
    });

    if (!crRes.ok) {
      console.error(`[poll] CR API error: ${crRes.status}`);
      throw new Error(`CR API unreachable: ${crRes.status}`);
    }

    const raw = await crRes.json();
    const battles = (Array.isArray(raw) ? raw : [])
      .map(parseBattleResult)
      .filter(Boolean);

    console.log(`[poll] ${battles.length} battles parsed for match ${matchId}`);

    // FIX: started_at may be a Mongo Date object or an ISO string — normalise both
    const startedAt = match.started_at instanceof Date
      ? match.started_at.getTime()
      : new Date(match.started_at).getTime();
    
    const result = battles.find((b: any) => {
      const battleTime = new Date(b.battleEndTime).getTime();
      const isAfterStart = battleTime > startedAt;
      // Match if either player is the opponent
      const isCorrectOpponent =
        b.opponent_tag === match.player2.tag ||
        b.team_tag     === match.player2.tag;
      return isAfterStart && isCorrectOpponent;
    });

    console.log("[poll] first battle sample:", JSON.stringify(battles[0], null, 2));
    console.log("[poll] looking for opponent tag:", match.player2.tag);
    console.log("[poll] startedAt:", new Date(startedAt).toISOString());
    // 3. No result yet — tell client to keep waiting
    if (!result) {
      console.log(`[poll] No result yet for match ${matchId}, startedAt: ${new Date(startedAt).toISOString()}`);
      return NextResponse.json({ found: false, matchId }, { status: 202 });
    }
    
    // 4. Determine winner & loser
    const winnerTag = result.winner_tag;
    const winner = match.player1.tag === winnerTag ? match.player1 : match.player2;

    // FIX: derive next match ID directly from the current match's stored nextMatchId
    // if available, otherwise fall back to the index formula — but use the bracket's
    // own match list to verify it actually exists before touching it.
    const nextMatchId: string | null = (() => {
      // Prefer an explicit nextMatchId field written by the generator
      if (match.nextMatchId) return match.nextMatchId;
      // Fall back: r{round+1}m{floor(index/2)}
      const candidate = `r${match.round + 1}m${Math.floor(match.index / 2)}`;
      const exists = bracket.matches.some((m: any) => m.matchId === candidate);
      return exists ? candidate : null;
    })();

    // Slot in the next match: even index → player1, odd index → player2
    const nextSlot = match.index % 2 === 0 ? "player1" : "player2";

    // Build update ops
    const updateOps: Record<string, any> = {
      "matches.$[current].status":     "completed",
      "matches.$[current].winner_tag": winnerTag,
      updated_at: new Date().toISOString(),
    };

    const arrayFilters: any[] = [{ "current.matchId": matchId }];

    if (nextMatchId) {
      updateOps[`matches.$[next].${nextSlot}`] = winner;
      arrayFilters.push({ "next.matchId": nextMatchId });
    }

    await db.collection("brackets").updateOne(
      { tournament_id: tournamentId },
      { $set: updateOps },
      { arrayFilters }
    );

    console.log(`[poll] Match ${matchId} completed. Winner: ${winnerTag}${nextMatchId ? `, advanced to ${nextMatchId} as ${nextSlot}` : " (final match)"}`);
    return NextResponse.json({ found: true, matchId, winner, result }, { status: 200 });

  } catch (err) {
    console.error("[poll] error:", err);
    return NextResponse.json(
      {
        error: "Failed to poll match",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}