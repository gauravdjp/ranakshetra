import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;
  const role = token?.role as string | undefined; // "player" | "organiser" | "club_leader"
  const { pathname } = req.nextUrl;

  // ── 1. Not logged in → redirect to login ──────────────────────────────
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ── 2. Block ID/detail pages for everyone ─────────────────────────────
  //    /arena/123, /club/456, /tournaments/789 → blocked
  const isDetailPage =
    /^\/arena\/[^/]+/.test(pathname) ||
    /^\/club\/[^/]+/.test(pathname) ||
    /^\/tournaments\/[^/]+/.test(pathname);

  if (isDetailPage) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // ── 3. Player page → only players allowed ─────────────────────────────
  if (pathname.startsWith("/player") && role !== "player") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/arena/:path*",
    "/club/:path*",
    "/leaderboard/:path*",
    "/player/:path*",
    "/tournaments/:path*",
    "/bracket0/:path*",
    "/bracket1/:path*",
    "/crapi/:path*",
  ],
};