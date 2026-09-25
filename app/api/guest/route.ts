// app/api/guest/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

function generateGuestId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "GUEST_";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST() {
  const guestId = generateGuestId();

  const client = await clientPromise;
  const db = client.db("RKS");

  await db.collection("guest").insertOne({
    guestId,
    role: "guest",
    email: null,
    password: null,
    createdAt: new Date(),
  });

  return NextResponse.json({ guestId });
}