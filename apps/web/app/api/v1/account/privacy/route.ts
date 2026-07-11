import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { prisma } from "@repo/db";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action } = await request.json();

    if (action === "export") {
      // Fetch user profile, addresses, linked accounts, orders
      const profile = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          addresses: true,
          oauthAccounts: true,
          orders: {
            include: {
              items: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: profile,
      });
    }

    if (action === "delete") {
      // Mock privacy deletion request
      console.warn(`[Privacy] Customer account deletion requested for user ID: ${user.id} (${user.email})`);
      
      // Stub: in real application, queue an asynchronous job or perform GDPR purge.
      return NextResponse.json({
        success: true,
        message: "Account deletion request received and placed under review. A support representative will email you shortly.",
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
