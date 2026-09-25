import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const DEMO_TOURNAMENT_ID = "T-CR-2026-001";

const DEFAULT_PLAYERS = [
  {
    username: "Odis",
    email: "odis@ranakshetra.gg",
    player_tag: "#220RULVURY",
    role: "player",
    joinedAt: new Date("2026-04-16T10:00:00Z"),
  },
  {
    username: "Cleatus",
    email: "cleatus@ranakshetra.gg",
    player_tag: "#20LJQVQQLV",
    role: "player",
    joinedAt: new Date("2026-04-16T10:05:00Z"),
  },
  {
    username: "Vinay",
    email: "vinay@ranakshetra.gg",
    player_tag: "#VP920CGQQ",
    role: "player",
    joinedAt: new Date("2026-04-16T10:10:00Z"),
  },
  {
    username: "Omkar",
    email: "omkar@ranakshetra.gg",
    player_tag: "#228GQ8JL8U",
    role: "player",
    joinedAt: new Date("2026-04-16T10:15:00Z"),
  },
];

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("RKS");

    const tournament = await db.collection("tournaments").findOne({ tournamentId: DEMO_TOURNAMENT_ID });
    const bracket = await db.collection("brackets").findOne({ tournament_id: DEMO_TOURNAMENT_ID });

    return NextResponse.json({
      tournamentId: DEMO_TOURNAMENT_ID,
      status: tournament?.status || "registration_open",
      playersCount: tournament?.players?.length || 0,
      hasBracket: !!bracket,
      totalMatches: bracket?.matches?.length || 0,
      completedMatches: bracket?.matches?.filter((m: any) => m.status === "completed")?.length || 0,
      liveMatches: bracket?.matches?.filter((m: any) => m.status === "live")?.length || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, matchId, winnerTag } = await req.json();
    const client = await clientPromise;
    const db = client.db("RKS");

    if (action === "reset") {
      // 1. Reset tournament doc to registration_open
      await db.collection("tournaments").updateOne(
        { tournamentId: DEMO_TOURNAMENT_ID },
        {
          $set: {
            title: "Clash Royale Champion Trophy",
            organizer_id: "Gaurav",
            game_id: "CLASH_ROYALE",
            region: "Central India",
            single_player: true,
            team_based: false,
            tournament_type: "single_elimination",
            status: "registration_open",
            visibility: "public",
            brackets_generated: false,
            results_declared: false,
            prize_pool: 25000,
            entry_fee: 0,
            participants_limit: 4,
            players: DEFAULT_PLAYERS,
            updated_at: new Date(),
          },
        },
        { upsert: true }
      );

      // 2. Remove any generated bracket
      await db.collection("brackets").deleteOne({ tournament_id: DEMO_TOURNAMENT_ID });

      return NextResponse.json({ success: true, message: "Tournament reset to Registration Open with 4 players." });
    }

    if (action === "generate") {
      // 1. Create fresh bracket for 4 players
      const matches = [
        {
          matchId: "r0m0",
          round: 0,
          index: 0,
          player1: { tag: DEFAULT_PLAYERS[0].player_tag, name: DEFAULT_PLAYERS[0].username },
          player2: { tag: DEFAULT_PLAYERS[1].player_tag, name: DEFAULT_PLAYERS[1].username },
          winner_tag: null,
          status: "pending",
          isBye: false,
          started_at: null,
        },
        {
          matchId: "r0m1",
          round: 0,
          index: 1,
          player1: { tag: DEFAULT_PLAYERS[2].player_tag, name: DEFAULT_PLAYERS[2].username },
          player2: { tag: DEFAULT_PLAYERS[3].player_tag, name: DEFAULT_PLAYERS[3].username },
          winner_tag: null,
          status: "pending",
          isBye: false,
          started_at: null,
        },
        {
          matchId: "r1m0",
          round: 1,
          index: 0,
          player1: { tag: "TBD", name: "TBD" },
          player2: { tag: "TBD", name: "TBD" },
          winner_tag: null,
          status: "pending",
          isBye: false,
          started_at: null,
        },
      ];

      await db.collection("brackets").updateOne(
        { tournament_id: DEMO_TOURNAMENT_ID },
        {
          $set: {
            tournament_id: DEMO_TOURNAMENT_ID,
            type: "standard",
            total_rounds: 2,
            matches,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        { upsert: true }
      );

      await db.collection("tournaments").updateOne(
        { tournamentId: DEMO_TOURNAMENT_ID },
        { $set: { status: "ongoing", brackets_generated: true, updated_at: new Date() } }
      );

      return NextResponse.json({ success: true, message: "Bracket generated with 2 Semi-Finals and 1 Final." });
    }

    if (action === "start-match") {
      const targetMatchId = matchId || "r0m0";
      await db.collection("brackets").updateOne(
        { tournament_id: DEMO_TOURNAMENT_ID, "matches.matchId": targetMatchId },
        {
          $set: {
            "matches.$.status": "live",
            "matches.$.started_at": new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }
      );
      return NextResponse.json({ success: true, message: `Match ${targetMatchId} is now LIVE. Live battlelog polling initiated.` });
    }

    if (action === "advance-winner") {
      const targetMatchId = matchId || "r0m0";
      const bracket = await db.collection("brackets").findOne({ tournament_id: DEMO_TOURNAMENT_ID });
      if (!bracket) return NextResponse.json({ error: "Bracket not found" }, { status: 404 });
      const match = bracket.matches.find((m: any) => m.matchId === targetMatchId);
      if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

      const chosenWinnerTag = winnerTag || match.player1.tag;
      const winner = match.player1.tag === chosenWinnerTag ? match.player1 : match.player2;

      const nextMatchId = `r${match.round + 1}m${Math.floor(match.index / 2)}`;
      const nextSlot = match.index % 2 === 0 ? "player1" : "player2";
      const nextExists = bracket.matches.some((m: any) => m.matchId === nextMatchId);

      const updateOps: any = {
        "matches.$[current].status": "completed",
        "matches.$[current].winner_tag": chosenWinnerTag,
        updated_at: new Date().toISOString(),
      };
      if (nextExists) updateOps[`matches.$[next].${nextSlot}`] = winner;

      const arrayFilters: any[] = [{ "current.matchId": targetMatchId }];
      if (nextExists) arrayFilters.push({ "next.matchId": nextMatchId });

      await db.collection("brackets").updateOne(
        { tournament_id: DEMO_TOURNAMENT_ID },
        { $set: updateOps },
        { arrayFilters }
      );

      if (!nextExists) {
        await db.collection("tournaments").updateOne(
          { tournamentId: DEMO_TOURNAMENT_ID },
          { $set: { status: "completed", results_declared: true, updated_at: new Date() } }
        );
      }

      return NextResponse.json({
        success: true,
        message: `${winner?.name || chosenWinnerTag} won ${targetMatchId}! Winner advanced to ${nextExists ? nextMatchId : "Champion Podium"}.`,
        winner,
        advancedTo: nextExists ? nextMatchId : "Podium",
      });
    }

    if (action === "api-preview") {
      const tag = encodeURIComponent("#VP920CGQQ");
      const startTime = Date.now();
      const res = await fetch(`https://proxy.royaleapi.dev/v1/players/${tag}/battlelog`, {
        headers: { Authorization: `Bearer ${process.env.CLASH_ROYALE_API_KEY}` },
      });
      const latencyMs = Date.now() - startTime;
      const raw = await res.json();
      return NextResponse.json({
        endpoint: `https://proxy.royaleapi.dev/v1/players/#VP920CGQQ/battlelog`,
        status: res.status,
        latencyMs,
        battlesCount: Array.isArray(raw) ? raw.length : 0,
        sample: Array.isArray(raw) && raw[0] ? raw[0] : null,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
