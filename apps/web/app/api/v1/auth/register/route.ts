import { prisma } from "@repo/db";
import { registerSchema } from "@repo/shared-types";
import { NextRequest, NextResponse } from "next/server";

import {
  createAuthCookie,
  createSessionToken,
  hashPassword,
} from "../../../../../lib/auth";

async function readFormBody(request: NextRequest) {
  const formData = await request.formData();

  return {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    firstName: String(formData.get("firstName") ?? "") || undefined,
    lastName: String(formData.get("lastName") ?? "") || undefined,
  };
}

export async function POST(request: NextRequest) {
  const body = registerSchema.safeParse(await readFormBody(request));

  if (!body.success) {
    return NextResponse.redirect(
      new URL("/register?error=invalid_input", request.url),
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: body.data.email },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.redirect(
      new URL("/register?error=email_in_use", request.url),
    );
  }

  const user = await prisma.user.create({
    data: {
      email: body.data.email,
      passwordHash: hashPassword(body.data.password),
      firstName: body.data.firstName,
      lastName: body.data.lastName,
    },
    select: { id: true },
  });

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(createAuthCookie(createSessionToken(user.id)));

  return response;
}