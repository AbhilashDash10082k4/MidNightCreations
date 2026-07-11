import {
  failure,
  isPlainObject,
  readPositiveInteger,
  success,
  type Schema,
} from "./schema";

export type PersonalizationValue = string | number | boolean | null;

export type CartItemInput = {
  variantId: string;
  quantity: number;
  personalization?: Record<string, PersonalizationValue>;
};

export type UpdateCartItemInput = {
  quantity: number;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function isPersonalizationValue(value: unknown): value is PersonalizationValue {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  );
}

export const cartItemSchema: Schema<CartItemInput> = {
  safeParse(value: unknown) {
    if (!isPlainObject(value)) {
      return failure("Invalid cart item.");
    }

    const variantId = String(value.variantId ?? "").trim();
    const quantity = readPositiveInteger(value.quantity, 99);

    if (!variantId || !isUuid(variantId)) {
      return failure("Invalid variant id.");
    }

    if (quantity === null) {
      return failure("Quantity must be between 1 and 99.");
    }

    const personalization = value.personalization;
    if (personalization !== undefined && !isPlainObject(personalization)) {
      return failure("Invalid personalization payload.");
    }

    if (
      personalization &&
      !Object.values(personalization).every(isPersonalizationValue)
    ) {
      return failure("Invalid personalization values.");
    }

    return success({
      variantId,
      quantity,
      personalization: personalization as
        Record<string, PersonalizationValue> | undefined,
    });
  },
};

export const updateCartItemSchema: Schema<UpdateCartItemInput> = {
  safeParse(value: unknown) {
    if (!isPlainObject(value)) {
      return failure("Invalid cart update.");
    }

    const quantity = readPositiveInteger(value.quantity, 99);
    if (quantity === null) {
      return failure("Quantity must be between 1 and 99.");
    }

    return success({ quantity });
  },
};
