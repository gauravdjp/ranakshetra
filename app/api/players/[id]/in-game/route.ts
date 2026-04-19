// app/api/players/[id]/in-game/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// POST — update in-game details for the logged-in player
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only allow the player themselves to update
  if (session.user.username !== id && session.user.player_tag !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { player_tag, games, skill_level, device, description, region } = body;

    const client = await clientPromise;
    const db = client.db("RKS");

    const filter = ObjectId.isValid(id)
      ? { _id: new ObjectId(id) }
      : { username: id };

    await db.collection("signup").updateOne(filter, {
      $set: {
        ...(player_tag   !== undefined && { player_tag }),
        ...(games        !== undefined && { games }),
        ...(skill_level  !== undefined && { skill_level }),
        ...(device       !== undefined && { device }),
        ...(description  !== undefined && { description }),
        ...(region       !== undefined && { region }),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/players/[id]/in-game", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
