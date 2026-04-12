import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  console.log("token:", token);           
  console.log("secret:", process.env.NEXTAUTH_SECRET);
  const isLoggedIn = !!token;

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
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