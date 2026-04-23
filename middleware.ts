import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "jft_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  const protectedPaths = ["/dashboard", "/teacher", "/admin", "/exam"];
  const requiresAuth = protectedPaths.some((path) => pathname.startsWith(path));

  if (requiresAuth && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/teacher/:path*", "/admin/:path*", "/exam/:path*"],
};