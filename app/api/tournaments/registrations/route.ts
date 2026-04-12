import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const tournamentId = searchParams.get("id");

    if (!tournamentId) return NextResponse.json({ registrations: [] });

    const client = await clientPromise;
    const db = client.db("RKS");

    const doc = await db.collection("tournaments").findOne({ tournamentId });
    return NextResponse.json({ registrations: doc?.players ?? [] });
}