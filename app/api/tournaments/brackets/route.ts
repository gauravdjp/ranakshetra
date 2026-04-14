import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("RKS");
    const bracket = await db.collection("brackets").findOne({ tournament_id: id });

    return NextResponse.json({ bracket: bracket ?? null });
  } catch (err) {
    console.error("[brackets GET] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}