import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { AccountController } from "../../../../../features/account/account.controller";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const methods = await AccountController.getPaymentMethods(user.id, user.role);
  return NextResponse.json({ paymentMethods: methods });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const method = await AccountController.createPaymentMethod(user.id, body, user.role);
    return NextResponse.json({ success: true, paymentMethod: method });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
