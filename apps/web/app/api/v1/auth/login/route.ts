import { prisma } from "@repo/db";
import { loginSchema } from "@repo/shared-types";
import { NextRequest, NextResponse } from "next/server";

import {
  createAuthCookie,
  createSessionToken,
  verifyPassword,
} from "../../../../../lib/auth";

async function readFormBody(request: NextRequest) {
  const formData = await request.formData();

  return {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
}

export async function POST(request: NextRequest) {
  const body = loginSchema.safeParse(await readFormBody(request));

  if (!body.success) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_input", request.url),
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: body.data.email },
  });

  if (
    !user?.passwordHash ||
    !verifyPassword(body.data.password, user.passwordHash)
  ) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_credentials", request.url),
    );
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(createAuthCookie(createSessionToken(user.id)));

  return response;
}
