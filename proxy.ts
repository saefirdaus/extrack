import type { NextRequest } from "next/server";

import { middleware as authMiddleware } from "./src/middleware";

export function proxy(request: NextRequest) {
  return authMiddleware(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
