import {
  isPlainObject,
  readTrimmedString,
  readOptionalTrimmedString,
  failure,
  success,
  type Schema,
} from "./schema";

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
};

export type ChangePasswordInput = {
  currentPassword?: string;
  newPassword?: string;
};

export type AddressInput = {
  label?: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
};

export type SavePaymentMethodInput = {
  stripePaymentMethodId: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault?: boolean;
};

export type ReturnRequestInput = {
  orderId: string;
  reason: string;
  photoUrl?: string;
};

export const updateProfileSchema: Schema<UpdateProfileInput> = {
  safeParse(value: unknown) {
    if (!isPlainObject(value)) {
      return failure("Invalid payload.");
    }
    return success({
      firstName: readOptionalTrimmedString(value.firstName),
      lastName: readOptionalTrimmedString(value.lastName),
      phone: readOptionalTrimmedString(value.phone),
      avatarUrl: readOptionalTrimmedString(value.avatarUrl),
    });
  },
};

export const changePasswordSchema: Schema<ChangePasswordInput> = {
  safeParse(value: unknown) {
    if (!isPlainObject(value)) {
      return failure("Invalid payload.");
    }
    const currentPassword = readTrimmedString(value.currentPassword);
    const newPassword = readTrimmedString(value.newPassword);

    if (!currentPassword) {
      return failure("Current password is required.");
    }
    if (!newPassword || newPassword.length < 8) {
      return failure("New password must be at least 8 characters.");
    }

    return success({ currentPassword, newPassword });
  },
};

export const addressInputSchema: Schema<AddressInput> = {
  safeParse(value: unknown) {
    if (!isPlainObject(value)) {
      return failure("Invalid address payload.");
    }
    const fullName = readTrimmedString(value.fullName);
    const line1 = readTrimmedString(value.line1);
    const city = readTrimmedString(value.city);
    const state = readTrimmedString(value.state);
    const postalCode = readTrimmedString(value.postalCode);
    const country = readTrimmedString(value.country) ?? "US";

    if (!fullName) return failure("Full name is required.");
    if (!line1) return failure("Address line 1 is required.");
    if (!city) return failure("City is required.");
    if (!state) return failure("State is required.");
    if (!postalCode) return failure("Postal code is required.");

    return success({
      label: readOptionalTrimmedString(value.label),
      fullName,
      line1,
      line2: readOptionalTrimmedString(value.line2),
      city,
      state,
      postalCode,
      country,
      phone: readOptionalTrimmedString(value.phone),
      isDefault: typeof value.isDefault === "boolean" ? value.isDefault : undefined,
    });
  },
};

export const savePaymentMethodSchema: Schema<SavePaymentMethodInput> = {
  safeParse(value: unknown) {
    if (!isPlainObject(value)) {
      return failure("Invalid payment payload.");
    }
    const stripePaymentMethodId = readTrimmedString(value.stripePaymentMethodId);
    const brand = readTrimmedString(value.brand);
    const last4 = readTrimmedString(value.last4);
    const expMonth = typeof value.expMonth === "number" ? value.expMonth : Number(value.expMonth);
    const expYear = typeof value.expYear === "number" ? value.expYear : Number(value.expYear);

    if (!stripePaymentMethodId) return failure("Stripe payment method ID is required.");
    if (!brand) return failure("Card brand is required.");
    if (!last4 || last4.length !== 4) return failure("Card last 4 digits are required.");
    if (isNaN(expMonth) || expMonth < 1 || expMonth > 12) return failure("Valid expiry month is required.");
    if (isNaN(expYear) || expYear < new Date().getFullYear() % 100) return failure("Valid expiry year is required.");

    return success({
      stripePaymentMethodId,
      brand,
      last4,
      expMonth,
      expYear,
      isDefault: typeof value.isDefault === "boolean" ? value.isDefault : undefined,
    });
  },
};

export const returnRequestSchema: Schema<ReturnRequestInput> = {
  safeParse(value: unknown) {
    if (!isPlainObject(value)) {
      return failure("Invalid return payload.");
    }
    const orderId = readTrimmedString(value.orderId);
    const reason = readTrimmedString(value.reason);

    if (!orderId) return failure("Order ID is required.");
    if (!reason) return failure("Reason for return is required.");

    return success({
      orderId,
      reason,
      photoUrl: readOptionalTrimmedString(value.photoUrl),
    });
  },
};
