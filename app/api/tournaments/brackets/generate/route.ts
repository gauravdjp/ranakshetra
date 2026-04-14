import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { BracketMatch, BracketDocument } from "@/types/index";

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
    const { tournamentId } = await req.json();
    const client = await clientPromise;
    const db = client.db("RKS");

    // Bail if already generated
    const existing = await db.collection("brackets").findOne({ tournament_id: tournamentId });
    if (existing) return NextResponse.json({ error: "Already generated" }, { status: 400 });

    // Fetch tournament + players array
    const tournament = await db.collection("tournaments").findOne({ tournamentId: tournamentId });
    console.log("[generate] tournament found:", !!tournament);
    console.log("[generate] players:", tournament?.players?.length);

    if (!tournament || !tournament.players || tournament.players.length < 2) {
      return NextResponse.json({ error: "Not enough players" }, { status: 400 });
    }

    const players = shuffle(tournament.players).map((r: any) => ({
      tag: r.player_tag as string,
      name: r.username as string,
    }));

    const count = players.length;
    const isStandard = isPowerOfTwo(count);
    const matches: BracketMatch[] = [];

    if (isStandard) {
      const totalRounds = Math.log2(count);
      for (let round = 0; round < totalRounds; round++) {
        const matchCount = count / Math.pow(2, round + 1);
        for (let index = 0; index < matchCount; index++) {
          matches.push({
            matchId: `r${round}m${index}`,
            round,
            index,
            player1: round === 0 ? players[index * 2]     : { tag: "TBD", name: "TBD" },
            player2: round === 0 ? players[index * 2 + 1] : { tag: "TBD", name: "TBD" },
            winner_tag: null,
            status: "pending",
            isBye: false,
            started_at: null,
          });
        }
      }
    } else {
      const rounds = calcByeRounds(count);
      rounds.forEach((round, roundIndex) => {
        for (let i = 0; i < round.matches; i++) {
          matches.push({
            matchId: `r${roundIndex}m${i}`,
            round: roundIndex,
            index: i,
            player1: roundIndex === 0 ? players[i * 2]              : { tag: "TBD", name: "TBD" },
            player2: roundIndex === 0 ? (players[i * 2 + 1] ?? null): { tag: "TBD", name: "TBD" },
            winner_tag: null,
            status: "pending",
            isBye: false,
            started_at: null,
          });
        }
        if (round.byes > 0) {
          const byePlayer = players[players.length - 1];
          matches.push({
            matchId: `r${roundIndex}m${round.matches}`,
            round: roundIndex,
            index: round.matches,
            player1: roundIndex === 0 ? byePlayer : { tag: "TBD", name: "TBD" },
            player2: null,
            winner_tag: roundIndex === 0 ? byePlayer.tag : null,
            status: roundIndex === 0 ? "completed" : "pending",
            isBye: true,
            started_at: null,
          });
        }
      });
    }

    const doc: BracketDocument = {
      tournament_id: tournamentId,
      type: isStandard ? "standard" : "bye",
      total_rounds: isStandard ? Math.log2(count) : calcByeRounds(count).length,
      matches,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db.collection("brackets").insertOne(doc);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[generate] error:", err);
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}