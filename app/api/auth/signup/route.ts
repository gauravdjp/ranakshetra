// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; // your existing connection

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("RKS"); 
    await db.collection("signup").insertOne(body);
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}