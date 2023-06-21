import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const EXPOSED_ROUTES_PREFIXES = ["/login", "/register", "/communities"];
const COMMUNITY_DEPENDENT_ROUTES = ["/items", "/requests", "/notifications"];

export const middleware = (request: NextRequest): NextResponse | undefined => {
  const { pathname } = request.nextUrl;

  const hasAccessToken = request.cookies.has("access_token");
  const hasRefreshToken = request.cookies.has("refresh_token");
  const hasCommunityId = request.cookies.has("community_id");

  const isAuthenticated = hasAccessToken && hasRefreshToken;

  if (!isAuthenticated && !EXPOSED_ROUTES_PREFIXES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated && pathname === "/") {
    return NextResponse.redirect(new URL("/items", request.url));
  }

  if (isAuthenticated && !hasCommunityId && COMMUNITY_DEPENDENT_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/communities", request.url));
  }
};

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next).*)",
};
