import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  AUTH_COOKIE_NAME,
  verifyToken,
} from "@/lib/auth/jwt";

const AUTH_ROUTES = new Set(["/login", "/register"]);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isDashboardRoute =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isAuthRoute = AUTH_ROUTES.has(pathname);
  const isRootRoute = pathname === "/";
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  if (isRootRoute) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const response = NextResponse.redirect(new URL("/login", request.url));
    if (token) {
      response.cookies.delete(AUTH_COOKIE_NAME);
    }
    return response;
  }

  if (isDashboardRoute && !session) {
    const response = NextResponse.redirect(new URL("/login", request.url));

    if (token) {
      response.cookies.delete(AUTH_COOKIE_NAME);
    }

    return response;
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isAuthRoute && token && !session) {
    const response = NextResponse.next();
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/register"],
};
