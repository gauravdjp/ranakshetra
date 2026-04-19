import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("RKS");
    const arenas = await db.collection("arenas").find({}).toArray();

    return NextResponse.json({ arenas });
  } catch (err) {
    console.error("[arenas GET] error:", err);
    return NextResponse.json({ error: "Failed to fetch arenas" }, { status: 500 });
  }
}
