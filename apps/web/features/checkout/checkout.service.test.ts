import { describe, test, expect, mock, beforeEach } from "bun:test";
import { CheckoutService } from "./checkout.service";

// Mock Repositories
const mockDiscountDb = new Map<string, any>();
const mockGiftCardDb = new Map<string, any>();

mock.module("@repo/db", () => {
  return {
    DiscountRepository: {
      getByCode: (code: string) => Promise.resolve(mockDiscountDb.get(code.toUpperCase().trim())),
      incrementUsedCount: (id: string) => Promise.resolve(),
    },
    GiftCardRepository: {
      getByCode: (code: string) => Promise.resolve(mockGiftCardDb.get(code.toUpperCase().trim())),
      redeem: (id: string, orderId: string, amount: number) => Promise.resolve(),
    },
    OrderRepository: {
      createOrder: (data: any) => Promise.resolve({ id: "order-123", orderNumber: "MC-100001", ...data }),
    },
  };
});

describe("CheckoutService Business Logic", () => {
  beforeEach(() => {
    mockDiscountDb.clear();
    mockGiftCardDb.clear();
  });

  test("validatePromoCode - active percentage code", async () => {
    mockDiscountDb.set("SAVE10", {
      id: "disc-1",
      code: "SAVE10",
      type: "percentage",
      value: 10.0,
      isActive: true,
      startsAt: null,
      endsAt: null,
      maxUses: null,
      usedCount: 0,
      minSpend: null,
    });

    const result = await CheckoutService.validatePromoCode("SAVE10", 100);
    expect(result.success).toBe(true);
    expect(result.discount?.amount).toBe(10);
  });

  test("validatePromoCode - expired code", async () => {
    mockDiscountDb.set("EXPIRED10", {
      id: "disc-2",
      code: "EXPIRED10",
      type: "percentage",
      value: 10.0,
      isActive: true,
      startsAt: null,
      endsAt: new Date(Date.now() - 10000), // in the past
      maxUses: null,
      usedCount: 0,
      minSpend: null,
    });

    const result = await CheckoutService.validatePromoCode("EXPIRED10", 100);
    expect(result.success).toBe(false);
    expect(result.error).toBe("expired");
  });

  test("validatePromoCode - minimum spend not met", async () => {
    mockDiscountDb.set("MIN50", {
      id: "disc-3",
      code: "MIN50",
      type: "fixed",
      value: 10.0,
      isActive: true,
      startsAt: null,
      endsAt: null,
      maxUses: null,
      usedCount: 0,
      minSpend: 50.0,
    });

    const result = await CheckoutService.validatePromoCode("MIN50", 40);
    expect(result.success).toBe(false);
    expect(result.error).toBe("minimum-not-met");
    expect(result.minSpend).toBe(50.0);
  });

  test("validateGiftCard - active gift card with balance", async () => {
    mockGiftCardDb.set("GIFT100", {
      id: "gc-1",
      code: "GIFT100",
      initialValue: 100.0,
      balance: 100.0,
      isActive: true,
      expiresAt: null,
    });

    const result = await CheckoutService.validateGiftCard("GIFT100");
    expect(result.success).toBe(true);
    expect(result.giftCard?.balance).toBe(100);
  });

  test("validateGiftCard - expired gift card", async () => {
    mockGiftCardDb.set("GC_EXPIRED", {
      id: "gc-2",
      code: "GC_EXPIRED",
      initialValue: 100.0,
      balance: 100.0,
      isActive: true,
      expiresAt: new Date(Date.now() - 10000),
    });

    const result = await CheckoutService.validateGiftCard("GC_EXPIRED");
    expect(result.success).toBe(false);
    expect(result.error).toBe("expired");
  });

  test("calculateTotals - shipping and tax Connecticut rules", async () => {
    // 6.35% tax on CT. Shipping is $5 flat under $75.
    const items = [
      {
        id: "item-1",
        productId: "prod-1",
        variantId: "var-1",
        quantity: 2,
        unitPrice: 20.0, // subtotal = 40
        personalization: {},
        productName: "Test T-shirt",
        productImage: "",
      },
    ];

    const pricing = await CheckoutService.calculateTotals(items, "ship");
    expect(pricing.subtotal).toBe(40);
    expect(pricing.shippingTotal).toBe(5); // under 75
    expect(pricing.taxTotal).toBe(2.54); // 40 * 0.0635 = 2.54
    expect(pricing.grandTotal).toBe(47.54); // 40 + 5 + 2.54
  });

  test("calculateTotals - shipping free over 75", async () => {
    const items = [
      {
        id: "item-1",
        productId: "prod-1",
        variantId: "var-1",
        quantity: 2,
        unitPrice: 40.0, // subtotal = 80
        personalization: {},
        productName: "Test Hoodie",
        productImage: "",
      },
    ];

    const pricing = await CheckoutService.calculateTotals(items, "ship");
    expect(pricing.subtotal).toBe(80);
    expect(pricing.shippingTotal).toBe(0); // free shipping
    expect(pricing.taxTotal).toBe(5.08); // 80 * 0.0635 = 5.08
    expect(pricing.grandTotal).toBe(85.08);
  });
});
