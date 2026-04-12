import {  NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tournamentId } = await req.json();

    const client = await clientPromise;
    const db = client.db("RKS");

    // Check if already joined
    const existing = await db.collection("tournaments").findOne({
        tournamentId,
        "players.player_tag": session.user.player_tag
    });

    if (existing) {
        return NextResponse.json({ error: "Already joined" }, { status: 400 });
    }

    await db.collection("tournaments").updateOne(
        { tournamentId },
        {
            $push: {
                players: {
                    username: session.user.username,
                    email: session.user.email,
                    player_tag: session.user.player_tag,
                    role: session.user.role,
                    joinedAt: new Date(),
                }
            } as any
        },
        { upsert: true }  // creates the tournament doc if it doesn't exist yet
    );

    return NextResponse.json({ success: true });
}   