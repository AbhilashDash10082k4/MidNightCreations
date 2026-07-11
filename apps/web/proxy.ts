import { NextRequest, NextResponse } from "next/server";

const authCookieName = "mc_session";

const protectedPrefixes = ["/account", "/checkout", "/api/v1/orders"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (request.cookies.get(authCookieName)?.value) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/api/v1/orders/:path*"],
};
