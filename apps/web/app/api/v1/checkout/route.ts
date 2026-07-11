import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { CheckoutController } from "../../../../features/checkout/checkout.controller";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { checkout, items } = body;

    if (!checkout || !items || !Array.isArray(items)) {
      return NextResponse.json(
        {
          error: "Invalid payload. Provide 'checkout' input and 'items' list.",
        },
        { status: 400 },
      );
    }

    const order = await CheckoutController.placeOrder(
      checkout,
      items,
      user?.id || null,
      user?.role || null,
    );

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process checkout" },
      { status: 400 },
    );
  }
}
