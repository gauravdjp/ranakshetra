// app/api/clashroyale/battlelog/route.ts
import { NextRequest, NextResponse } from "next/server";
import { parseBattleResult } from "./parsebattlelog";
export async function GET(req: NextRequest) {
  const tag = req.nextUrl.searchParams.get("tag");
  if (!tag) return NextResponse.json({ error: "Tag required" }, { status: 400 });

  const encodedTag = encodeURIComponent(tag);

  const res = await fetch(`https://proxy.royaleapi.dev/v1/players/${encodedTag}/battlelog`, {
    headers: {
      Authorization: `Bearer ${process.env.CLASH_ROYALE_API_KEY}`,
    },
  });

  const data = await res.json();
  const parsedData = data.map(parseBattleResult);
  return NextResponse.json(parsedData, { status: res.status });
}