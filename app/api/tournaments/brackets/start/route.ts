import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { tournamentId, matchId } = await req.json();
    const client = await clientPromise;
    const db = client.db("RKS");

    const bracket = await db.collection("brackets").findOne({ tournament_id: tournamentId });
    if (!bracket) return NextResponse.json({ error: "Bracket not found" }, { status: 404 });

    const match = bracket.matches.find((m: any) => m.matchId === matchId);
    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

    // The two players in the match or an organizer/admin can start it
    const userRole = (session.user as any).role;
    const tag = (session.user as any).player_tag;
    const isPlayer = tag && (match.player1.tag === tag || match.player2?.tag === tag);
    const isStaffOrDev = userRole === "organiser" || userRole === "admin" || !tag || process.env.NODE_ENV === "development";

    if (!isPlayer && !isStaffOrDev) {
      return NextResponse.json({ error: "Not your match" }, { status: 403 });
    }

    if (match.status !== "pending") {
      return NextResponse.json({ error: "Match already started" }, { status: 400 });
    }

    await db.collection("brackets").updateOne(
      { tournament_id: tournamentId, "matches.matchId": matchId },
      {
        $set: {
          "matches.$.status": "live",
          "matches.$.started_at": new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[start] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}