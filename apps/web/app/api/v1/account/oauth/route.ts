import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { prisma } from "@repo/db";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const linked = await prisma.oauthAccount.findMany({
    where: { userId: user.id },
    select: { provider: true, createdAt: true },
  });

  return NextResponse.json({ accounts: linked });
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");

  if (!provider) {
    return NextResponse.json({ error: "Provider name is required." }, { status: 400 });
  }

  try {
    await prisma.oauthAccount.deleteMany({
      where: { userId: user.id, provider },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { provider, providerUid } = await request.json();
    if (!provider || !providerUid) {
      return NextResponse.json({ error: "Provider details required." }, { status: 400 });
    }

    const connected = await prisma.oauthAccount.create({
      data: {
        userId: user.id,
        provider,
        providerUid,
      },
    });

    return NextResponse.json({ success: true, connected });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
