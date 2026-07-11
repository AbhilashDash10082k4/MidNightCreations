import { NextRequest, NextResponse } from "next/server";
import { CheckoutController } from "../../../../../features/checkout/checkout.controller";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await CheckoutController.validatePromoCode(body);
    return NextResponse.json({ success: true, discount: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to validate promo code" },
      { status: 400 },
    );
  }
}
