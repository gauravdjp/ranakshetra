import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tournamentId } = await req.json();

    const client = await clientPromise;
    const db = client.db("RKS");

    // Check if already joined
    const existing = await db.collection("tournaments").findOne({
        tournamentId,
        "players.player_tag": (session.user as any).player_tag
    });

    if (existing) {
        return NextResponse.json({ error: "Already joined" }, { status: 400 });
    }

    await db.collection("tournaments").updateOne(
        { tournamentId },
        {
            $push: {
                players: {
                    username: (session.user as any).username,
                    email: session.user.email,
                    player_tag: (session.user as any).player_tag,
                    role: (session.user as any).role,
                    joinedAt: new Date(),
                }
            } as any
        },
        { upsert: true }  // creates the tournament doc if it doesn't exist yet
    );

    return NextResponse.json({ success: true });
}   