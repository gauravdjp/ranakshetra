import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const { tournamentId, matchId, winnerTag } = await req.json();
  const client = await clientPromise;
  const db = client.db("RKS");

  const bracket = await db.collection("brackets").findOne({ tournament_id: tournamentId });
  if (!bracket) return NextResponse.json({ error: "Bracket not found" }, { status: 404 });
  const match = bracket?.matches.find((m: any) => m.matchId === matchId);
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const winner = match.player1.tag === winnerTag ? match.player1 : match.player2;
  const nextMatchId = `r${match.round + 1}m${Math.floor(match.index / 2)}`;
  const nextSlot = match.index % 2 === 0 ? "player1" : "player2";
  const nextExists = bracket.matches.some((m: any) => m.matchId === nextMatchId);

  const updateOps: any = {
    "matches.$[current].status": "completed",
    "matches.$[current].winner_tag": winnerTag,
    updated_at: new Date().toISOString(),
  };
  if (nextExists) updateOps[`matches.$[next].${nextSlot}`] = winner;

  const arrayFilters: any[] = [{ "current.matchId": matchId }];
  if (nextExists) arrayFilters.push({ "next.matchId": nextMatchId });

  await db.collection("brackets").updateOne(
    { tournament_id: tournamentId },
    { $set: updateOps },
    { arrayFilters }
  );

  // If final match completed, mark tournament completed
  if (!nextExists) {
    try {
      const { ObjectId } = await import("mongodb");
      const tFilter: any = ObjectId.isValid(tournamentId)
        ? { $or: [{ _id: new ObjectId(tournamentId) }, { tournamentId }] }
        : { tournamentId };
      await db.collection("tournaments").updateOne(
        tFilter,
        { $set: { status: "completed", results_declared: true, updated_at: new Date() } }
      );
    } catch (e) {
      console.error("[test-winner] tournament status update error:", e);
    }
  }

  return NextResponse.json({ success: true, winner });
}