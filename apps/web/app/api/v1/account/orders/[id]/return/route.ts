import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../../../lib/auth";
import { AccountController } from "../../../../../../../features/account/account.controller";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const returnRequest = await AccountController.createReturn(
      user.id,
      { ...body, orderId: id },
      user.role,
    );
    return NextResponse.json({ success: true, returnRequest });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
