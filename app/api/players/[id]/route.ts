// app/api/players/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const client = await clientPromise;
    const db = client.db("RKS");

    // Try ObjectId first, then fall back to username match
    let player = null;
    if (ObjectId.isValid(id)) {
      player = await db.collection("signup").findOne({ _id: new ObjectId(id) });
    }
    if (!player) {
      player = await db.collection("signup").findOne({ username: id });
    }

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Strip sensitive fields
    const { password: _pw, ...safe } = player;
    return NextResponse.json({ player: { ...safe, _id: safe._id?.toString() } });
  } catch (err) {
    console.error("GET /api/players/[id]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
