import { NextResponse } from "next/server";
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
