import { CheckoutService } from "./checkout.service";
import { checkoutSchema, discountValidateSchema, giftCardValidateSchema } from "@repo/shared-types";
import type { CartItem } from "../cart/context/cart-context";

export class CheckoutController {
  static async validatePromoCode(payload: unknown) {
    const parsed = discountValidateSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
    }

    const { code, subtotal } = parsed.data;
    const result = await CheckoutService.validatePromoCode(code, subtotal);
    if (!result.success) {
      throw new Error(
        result.error === "expired"
          ? "Promo code has expired."
          : result.error === "minimum-not-met"
            ? `Minimum spend of $${result.minSpend?.toFixed(2)} not met.`
            : "Invalid promo code.",
      );
    }

    return result.discount;
  }

  static async validateGiftCard(payload: unknown) {
    const parsed = giftCardValidateSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
    }

    const { code } = parsed.data;
    const result = await CheckoutService.validateGiftCard(code);
    if (!result.success) {
      throw new Error(
        result.error === "expired"
          ? "Gift card has expired."
          : "Invalid gift card or zero balance.",
      );
    }

    return result.giftCard;
  }

  static async placeOrder(
    payload: unknown,
    items: CartItem[],
    userId?: string | null,
    role?: string | null,
  ) {
    // Basic structural validation
    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
    }

    // Cast the payload to include optional giftCardCode
    const rawPayload = payload as any;
    const giftCardCode = rawPayload.giftCardCode || undefined;

    return CheckoutService.placeOrder(
      {
        ...parsed.data,
        giftCardCode,
      },
      items,
      userId,
      role,
    );
  }
}
