import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("RKS");
    const updates = await db.collection("updates").find({}).sort({ created_at: -1 }).toArray();

    return NextResponse.json({ updates });
  } catch (err) {
    console.error("[updates GET] error:", err);
    return NextResponse.json({ error: "Failed to fetch updates" }, { status: 500 });
  }
}

// FIX: POST handler was missing — organiser dashboard POSTs to /api/updates but got 405
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, body: msgBody, tag } = body;

    if (!title?.trim() || !msgBody?.trim()) {
      return NextResponse.json(
        { error: "title and body are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("RKS");

    const update = {
      title:      title.trim(),
      body:       msgBody.trim(),
      tag:        tag ?? "update",
      pinned:     false,
      created_at: new Date(),
    };

    const result = await db.collection("updates").insertOne(update);

    return NextResponse.json(
      { update: { ...update, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (err) {
    console.error("[updates POST] error:", err);
    return NextResponse.json({ error: "Failed to post update" }, { status: 500 });
  }
}
