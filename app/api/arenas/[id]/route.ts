import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("RKS");

    const filterConditions: Record<string, unknown>[] = [
      { _id: id },
      { organizer_id: id },
      { "members.user_id": id },
    ];

    if (ObjectId.isValid(id)) {
      try {
        filterConditions.push({ _id: new ObjectId(id) });
      } catch {}
    }

    let arena = await db.collection("arenas").findOne({ $or: filterConditions });

    // If no arena exists yet but the ID is a user who is an organiser, auto-create their default arena
    if (!arena) {
      const userConditions: any[] = [{ id }];
      if (ObjectId.isValid(id)) {
        try {
          userConditions.push({ _id: new ObjectId(id) });
        } catch {}
      }
      const orgUser = await db.collection("user").findOne({
        $or: userConditions,
      });

      if (orgUser && (orgUser.role === "organiser" || orgUser.role === "admin")) {
        const orgProfile = await db.collection("user_organiser").findOne({ userId: id });
        const newArena = {
          arena_name: orgProfile?.arenaName || `${orgUser.username || "Organiser"}'s Arena`,
          arena_location: [orgProfile?.city, orgProfile?.stateProvince, orgProfile?.country].filter(Boolean).join(", "),
          arena_city: orgProfile?.city || "",
          arena_state: orgProfile?.stateProvince || "",
          organizer_id: id,
          organizer_name: orgUser.username || "Organiser",
          supported_games: Array.isArray(orgProfile?.primaryGameSupport) ? orgProfile.primaryGameSupport : ["CLASH ROYALE"],
          members: [{ user_id: id, name: orgUser.username || "Organiser", role: "owner" }],
          is_verified: true,
          created_at: new Date(),
        };

        const insertRes = await db.collection("arenas").insertOne(newArena);
        arena = { ...newArena, _id: insertRes.insertedId };
      }
    }

    if (!arena) {
      return NextResponse.json({ error: "Arena not found" }, { status: 404 });
    }

    return NextResponse.json({ arena });
  } catch (err) {
    console.error("[arenas/[id] GET] error:", err);
    return NextResponse.json({ error: "Failed to fetch arena" }, { status: 500 });
  }
}
