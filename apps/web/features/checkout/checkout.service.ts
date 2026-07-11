import { DiscountRepository, GiftCardRepository, OrderRepository } from "@repo/db";
import type { CartItem } from "../cart/context/cart-context";
import type { CheckoutInput } from "@repo/shared-types";

export type PricingSummary = {
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  discountTotal: number;
  giftCardRedeemedAmount: number;
  grandTotal: number;
  discountId?: string | null;
  giftCardId?: string | null;
};

export class CheckoutService {
  static async validatePromoCode(code: string, subtotal: number) {
    const discount = await DiscountRepository.getByCode(code);

    if (!discount) {
      return { success: false, error: "invalid" as const };
    }

    if (!discount.isActive) {
      return { success: false, error: "invalid" as const };
    }

    const now = new Date();
    if (discount.startsAt && discount.startsAt > now) {
      return { success: false, error: "invalid" as const };
    }

    if (discount.endsAt && discount.endsAt < now) {
      return { success: false, error: "expired" as const };
    }

    if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
      return { success: false, error: "expired" as const };
    }

    const minSpendVal = discount.minSpend ? Number(discount.minSpend) : 0;
    if (minSpendVal > 0 && subtotal < minSpendVal) {
      return { success: false, error: "minimum-not-met" as const, minSpend: minSpendVal };
    }

    let discountAmount = 0;
    const valueNum = Number(discount.value);
    if (discount.type === "percentage") {
      discountAmount = Number((subtotal * (valueNum / 100)).toFixed(2));
    } else if (discount.type === "fixed") {
      discountAmount = valueNum;
    }

    // Discount cannot exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    return {
      success: true,
      discount: {
        id: discount.id,
        code: discount.code,
        type: discount.type,
        value: valueNum,
        amount: discountAmount,
      },
    };
  }

  static async validateGiftCard(code: string) {
    const giftCard = await GiftCardRepository.getByCode(code);

    if (!giftCard) {
      return { success: false, error: "invalid" as const };
    }

    if (!giftCard.isActive || Number(giftCard.balance) <= 0) {
      return { success: false, error: "invalid" as const }; // inactive or zero balance is invalid for checkout
    }

    const now = new Date();
    if (giftCard.expiresAt && giftCard.expiresAt < now) {
      return { success: false, error: "expired" as const };
    }

    return {
      success: true,
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        balance: Number(giftCard.balance),
      },
    };
  }

  static async calculateTotals(
    items: CartItem[],
    fulfillmentMethod: "ship" | "pickup",
    promoCode?: string,
    giftCardCode?: string,
  ): Promise<PricingSummary> {
    const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

    // Calculate shipping
    let shippingTotal = 0;
    if (fulfillmentMethod === "ship") {
      // Standard shipping rule: $5.00 flat, free if subtotal >= 75
      shippingTotal = subtotal >= 75 ? 0 : 5.00;
    }

    // Calculate promo discounts
    let discountTotal = 0;
    let discountId: string | null = null;
    if (promoCode) {
      const discountResult = await this.validatePromoCode(promoCode, subtotal);
      if (discountResult.success && discountResult.discount) {
        discountTotal = discountResult.discount.amount;
        discountId = discountResult.discount.id;
      }
    }

    // Intermediate total before tax
    const taxableAmount = Math.max(0, subtotal - discountTotal);
    
    // Flat tax 6.35% (CT tax) on the discounted subtotal
    const taxTotal = Number((taxableAmount * 0.0635).toFixed(2));

    // Grand total before gift card application
    const preGiftCardTotal = Number((taxableAmount + shippingTotal + taxTotal).toFixed(2));

    // Apply gift card
    let giftCardRedeemedAmount = 0;
    let giftCardId: string | null = null;
    if (giftCardCode) {
      const giftCardResult = await this.validateGiftCard(giftCardCode);
      if (giftCardResult.success && giftCardResult.giftCard) {
        giftCardId = giftCardResult.giftCard.id;
        const balance = giftCardResult.giftCard.balance;
        // Apply gift card balance up to pre-gift-card total
        giftCardRedeemedAmount = Number(Math.min(balance, preGiftCardTotal).toFixed(2));
      }
    }

    const grandTotal = Number(Math.max(0, preGiftCardTotal - giftCardRedeemedAmount).toFixed(2));

    return {
      subtotal,
      shippingTotal,
      taxTotal,
      discountTotal,
      giftCardRedeemedAmount,
      grandTotal,
      discountId,
      giftCardId,
    };
  }

  static async placeOrder(
    input: CheckoutInput & { giftCardCode?: string },
    items: CartItem[],
    userId?: string | null,
    role?: string | null,
  ) {
    if (items.length === 0) {
      throw new Error("Cannot checkout with empty cart.");
    }

    // Calculate the final totals based on checkout parameters
    const pricing = await this.calculateTotals(
      items,
      input.fulfillmentMethod,
      input.discountCode,
      input.giftCardCode,
    );

    // Call order repository to persist order
    const order = await OrderRepository.createOrder({
      userId,
      role,
      email: input.email,
      fulfillmentMethod: input.fulfillmentMethod,
      notes: input.notes,
      shippingAddress: input.shippingAddress,
      billingAddress: input.billingAddress,
      items: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        personalization: item.personalization,
      })),
      pricing: {
        subtotal: pricing.subtotal,
        shippingTotal: pricing.shippingTotal,
        taxTotal: pricing.taxTotal,
        discountTotal: pricing.discountTotal,
        grandTotal: pricing.grandTotal,
        discountId: pricing.discountId,
        giftCardId: pricing.giftCardId,
        giftCardRedeemedAmount: pricing.giftCardRedeemedAmount,
      },
    });

    return order;
  }
}
