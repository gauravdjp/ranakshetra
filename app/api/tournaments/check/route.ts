import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ joined: false });

    const { tournamentId } = await req.json();
    const client = await clientPromise;
    const db = client.db("RKS");

    const existing = await db.collection("tournaments").findOne({
        tournamentId,
        "players.player_tag": (session.user as any).player_tag
    });

    return NextResponse.json({ joined: !!existing });
}