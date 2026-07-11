import { describe, test, expect } from "bun:test";
import {
  calculateItemPrice,
  calculateLineTotal,
  calculateOrderSummary,
} from "./pricing";

describe("Pricing Domain", () => {
  test("calculateItemPrice without personalization", () => {
    const price = calculateItemPrice(19.99);
    expect(price).toBe(19.99);
  });

  test("calculateItemPrice with personalization", () => {
    const price = calculateItemPrice(19.99, [{ extraPrice: 2.5 }, { extraPrice: 1.5 }]);
    expect(price).toBe(23.99);
  });

  test("calculateLineTotal computes correct amount", () => {
    const total = calculateLineTotal(23.99, 3);
    expect(total).toBe(71.97);
  });

  test("calculateOrderSummary calculates correct totals", () => {
    const summary = calculateOrderSummary({
      items: [
        { unitPrice: 20.0, quantity: 2 },
        { unitPrice: 15.0, quantity: 1 },
      ],
      shippingRate: 5.99,
      taxRate: 0.1, // 10% tax
      discountAmount: 5.0,
    });

    // Subtotal: 20 * 2 + 15 = 55.0
    // Discounted subtotal: 55.0 - 5.0 = 50.0
    // Tax: 50.0 * 0.1 = 5.0
    // Grand total: 50.0 + 5.0 (tax) + 5.99 (shipping) = 60.99
    expect(summary.subtotal).toBe(55.0);
    expect(summary.discountTotal).toBe(5.0);
    expect(summary.taxTotal).toBe(5.0);
    expect(summary.shippingTotal).toBe(5.99);
    expect(summary.grandTotal).toBe(60.99);
  });
});
