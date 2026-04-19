import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("RKS");
    const clubs = await db.collection("clubs").find({}).toArray();

    return NextResponse.json({ clubs });
  } catch (err) {
    console.error("[clubs GET] error:", err);
    return NextResponse.json({ error: "Failed to fetch clubs" }, { status: 500 });
  }
}
