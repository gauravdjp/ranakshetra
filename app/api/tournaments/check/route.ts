import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ joined: false });

    const { tournamentId } = await req.json();
    const client = await clientPromise;
    const db = client.db("RKS");

    const existing = await db.collection("tournaments").findOne({
        tournamentId,
        "players.player_tag": session.user.player_tag
    });

    return NextResponse.json({ joined: !!existing });
}