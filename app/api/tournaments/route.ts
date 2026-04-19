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
