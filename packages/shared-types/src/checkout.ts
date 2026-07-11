import {
  isPlainObject,
  readTrimmedString,
  readOptionalTrimmedString,
  failure,
  success,
  type Schema,
} from "./schema";

export type CheckoutAddressInput = {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
};

export type CheckoutInput = {
  email: string;
  shippingAddress: CheckoutAddressInput;
  billingAddress?: CheckoutAddressInput;
  fulfillmentMethod: "ship" | "pickup";
  discountCode?: string;
  notes?: string;
};

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 320;
}

function parseAddress(value: unknown) {
  if (!isPlainObject(value)) {
    return null;
  }

  const fullName = readTrimmedString(value.fullName);
  const line1 = readTrimmedString(value.line1);
  const city = readTrimmedString(value.city);
  const state = readTrimmedString(value.state);
  const postalCode = readTrimmedString(value.postalCode);
  const country = readOptionalTrimmedString(value.country) ?? "US";

  if (!fullName || !line1 || !city || !state || !postalCode) {
    return null;
  }

  return {
    fullName,
    line1,
    line2: readOptionalTrimmedString(value.line2),
    city,
    state,
    postalCode,
    country,
    phone: readOptionalTrimmedString(value.phone),
  } satisfies CheckoutAddressInput;
}

export const checkoutSchema: Schema<CheckoutInput> = {
  safeParse(value: unknown) {
    if (!isPlainObject(value)) {
      return failure("Invalid checkout payload.");
    }

    const email = readTrimmedString(value.email);
    const shippingAddress = parseAddress(value.shippingAddress);
    const billingAddress = value.billingAddress
      ? parseAddress(value.billingAddress)
      : undefined;
    const fulfillmentMethod =
      value.fulfillmentMethod === "pickup" ? "pickup" : "ship";

    if (!email || !isEmail(email)) {
      return failure("Invalid email address.");
    }

    if (!shippingAddress) {
      return failure("Shipping address is required.");
    }

    if (value.billingAddress && !billingAddress) {
      return failure("Invalid billing address.");
    }

    return success({
      email,
      shippingAddress,
      billingAddress: billingAddress ?? undefined,
      fulfillmentMethod,
      discountCode: readOptionalTrimmedString(value.discountCode),
      notes: readOptionalTrimmedString(value.notes),
    });
  },
};

export type DiscountValidateInput = {
  code: string;
  subtotal: number;
};

export const discountValidateSchema: Schema<DiscountValidateInput> = {
  safeParse(value: unknown) {
    if (!isPlainObject(value)) {
      return failure("Invalid validation request.");
    }
    const code = readTrimmedString(value.code);
    const subtotal = typeof value.subtotal === "number" ? value.subtotal : Number(value.subtotal || 0);

    if (!code) {
      return failure("Promo code is required.");
    }
    if (isNaN(subtotal) || subtotal <= 0) {
      return failure("Valid subtotal is required.");
    }

    return success({
      code,
      subtotal,
    });
  },
};

export type GiftCardValidateInput = {
  code: string;
};

export const giftCardValidateSchema: Schema<GiftCardValidateInput> = {
  safeParse(value: unknown) {
    if (!isPlainObject(value)) {
      return failure("Invalid validation request.");
    }
    const code = readTrimmedString(value.code);

    if (!code) {
      return failure("Gift card code is required.");
    }

    return success({
      code,
    });
  },
};
