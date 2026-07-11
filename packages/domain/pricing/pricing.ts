export type PersonalizationOption = {
  extraPrice: number;
};

export function calculateItemPrice(
  variantPrice: number,
  personalizations: PersonalizationOption[] = [],
): number {
  const personalizationExtra = personalizations.reduce(
    (sum, item) => sum + item.extraPrice,
    0,
  );
  return Number((variantPrice + personalizationExtra).toFixed(2));
}

export function calculateLineTotal(itemPrice: number, quantity: number): number {
  return Number((itemPrice * quantity).toFixed(2));
}

export type OrderSummaryInput = {
  items: {
    unitPrice: number;
    quantity: number;
  }[];
  shippingRate?: number;
  taxRate?: number;
  discountAmount?: number;
};

export function calculateOrderSummary({
  items,
  shippingRate = 0,
  taxRate = 0,
  discountAmount = 0,
}: OrderSummaryInput) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const taxTotal = discountedSubtotal * taxRate;
  const grandTotal = discountedSubtotal + taxTotal + shippingRate;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountTotal: Number(discountAmount.toFixed(2)),
    taxTotal: Number(taxTotal.toFixed(2)),
    shippingTotal: Number(shippingRate.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
  };
}
