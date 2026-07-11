import { NextRequest, NextResponse } from "next/server";

import { authCookieName, getCurrentUserFromToken } from "../../../../../lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(authCookieName)?.value;
  const user = await getCurrentUserFromToken(token);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}