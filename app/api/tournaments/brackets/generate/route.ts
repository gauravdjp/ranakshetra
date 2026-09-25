import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { BracketMatch, BracketDocument, Tournament_Registration } from "@/types/index";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isPowerOfTwo(n: number) {
  return n > 1 && (n & (n - 1)) === 0;
}

function calcByeRounds(count: number) {
  const rounds: { matches: number; byes: number }[] = [];
  let teams = count;
  while (teams > 1) {
    if (teams % 2 === 0) {
      rounds.push({ matches: teams / 2, byes: 0 });
      teams = teams / 2;
    } else {
      rounds.push({ matches: Math.floor(teams / 2), byes: 1 });
      teams = Math.floor(teams / 2) + 1;
    }
  }
  return rounds;
}

export async function POST(req: NextRequest) {
  try {
    const { tournamentId, force = false } = await req.json();

    if (!tournamentId) {
      return NextResponse.json({ error: "tournamentId is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("RKS");

    // FIX: Allow force regeneration
    if (!force) {
      const existing = await db.collection("brackets").findOne({ tournament_id: tournamentId });
      if (existing) {
        console.log(`[generate] Rejection: Bracket already exists for ${tournamentId}`);
        return NextResponse.json({ error: "Already generated" }, { status: 400 });
      }
    } else {
      await db.collection("brackets").deleteOne({ tournament_id: tournamentId });
    }

    let tournament: any = null;
    if (ObjectId.isValid(tournamentId)) {
      try {
        tournament = await db.collection("tournaments").findOne({ _id: new ObjectId(tournamentId) });
      } catch {}
    }
    if (!tournament) {
      tournament = await db.collection("tournaments").findOne({ tournamentId });
    }
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    let registrations: any[] = tournament.players || [];
    if (!registrations || registrations.length === 0) {
      registrations = await db
        .collection("registrations")
        .find({ tournament_id: tournamentId })
        .toArray();
    }

    if (!registrations || registrations.length < 2) {
      return NextResponse.json(
        { error: `Not enough players (${registrations?.length ?? 0} registered, need at least 2)` },
        { status: 400 }
      );
    }

    // Map registrations → bracket player format
    const players = shuffle(registrations).map((r) => ({
      tag:  r.player_tag,
      name: r.username,
    }));

    const count = players.length;
    const isStandard = isPowerOfTwo(count);
    const matches: BracketMatch[] = [];
    let finalTotalRounds = 0;

    if (isStandard) {
      finalTotalRounds = Math.log2(count) | 0;
      for (let round = 0; round < finalTotalRounds; round++) {
        const matchCount = count / Math.pow(2, round + 1);
        for (let index = 0; index < matchCount; index++) {
          matches.push({
            matchId:    `r${round}m${index}`,
            round,
            index,
            player1:    round === 0 ? players[index * 2]     : { tag: "TBD", name: "TBD" },
            player2:    round === 0 ? players[index * 2 + 1] : { tag: "TBD", name: "TBD" },
            winner_tag: null,
            status:     "pending",
            isBye:      false,
            started_at: null,
          });
        }
      }
    } else {
      const roundsData = calcByeRounds(count);
      finalTotalRounds = roundsData.length;

      roundsData.forEach((round, roundIndex) => {
        for (let i = 0; i < round.matches; i++) {
          matches.push({
            matchId:    `r${roundIndex}m${i}`,
            round:      roundIndex,
            index:      i,
            player1:    roundIndex === 0 ? players[i * 2]               : { tag: "TBD", name: "TBD" },
            player2:    roundIndex === 0 ? (players[i * 2 + 1] ?? null) : { tag: "TBD", name: "TBD" },
            winner_tag: null,
            status:     "pending",
            isBye:      false,
            started_at: null,
          });
        }

        if (round.byes > 0) {
          const byePlayer = roundIndex === 0 ? players[players.length - 1] : { tag: "TBD", name: "TBD" };
          matches.push({
            matchId:    `r${roundIndex}m${round.matches}`,
            round:      roundIndex,
            index:      round.matches,
            player1:    byePlayer,
            player2:    null,
            winner_tag: roundIndex === 0 ? byePlayer.tag : null,
            status:     roundIndex === 0 ? "completed" : "pending",
            isBye:      true,
            started_at: null,
          });
        }
      });
    }

    const doc: BracketDocument = {
      tournament_id: tournamentId,
      type:          isStandard ? "standard" : "bye",
      total_rounds:  finalTotalRounds,
      matches,
      created_at:    new Date().toISOString(),
      updated_at:    new Date().toISOString(),
    };

    await db.collection("brackets").insertOne(doc);

    // Mark tournament as brackets_generated and status ongoing
    const tFilter: any = ObjectId.isValid(tournamentId)
      ? { $or: [{ _id: new ObjectId(tournamentId) }, { tournamentId }] }
      : { tournamentId };
    await db.collection("tournaments").updateOne(
      tFilter,
      { $set: { brackets_generated: true, status: "ongoing", updated_at: new Date() } }
    );

    return NextResponse.json({ success: true, total_rounds: finalTotalRounds, total_matches: matches.length });
  } catch (err) {
    console.error("[generate] error:", err);
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}