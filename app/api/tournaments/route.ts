import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("RKS");
    const tournaments = await db.collection("tournaments").find({}).toArray();

    return NextResponse.json({ tournaments });
  } catch (err) {
    console.error("[tournaments GET] error:", err);
    return NextResponse.json({ error: "Failed to fetch tournaments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.game_id) {
      return NextResponse.json(
        { error: "Title and game_id are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("RKS");

    const tournament = {
      ...body,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await db.collection("tournaments").insertOne(tournament);

    return NextResponse.json(
      { tournament: { ...tournament, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (err) {
    console.error("[tournaments POST] error:", err);
    return NextResponse.json(
      { error: "Failed to create tournament" },
      { status: 500 }
    );
  }
}
