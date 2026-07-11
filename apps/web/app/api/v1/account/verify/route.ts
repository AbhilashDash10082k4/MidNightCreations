import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { prisma } from "@repo/db";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { emailVerifiedAt: true },
  });

  return NextResponse.json({
    verified: dbUser?.emailVerifiedAt !== null,
    verifiedAt: dbUser?.emailVerifiedAt,
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock resend email verification
  console.log(`[Verification] Resending verification token to: ${user.email}`);

  // Simulating email dispatch
  return NextResponse.json({
    success: true,
    message: `Verification link sent to ${user.email}.`,
  });
}
