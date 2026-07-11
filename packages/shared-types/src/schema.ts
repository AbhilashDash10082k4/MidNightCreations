export type SafeParseSuccess<T> = {
  success: true;
  data: T;
};

export type SafeParseFailure = {
  success: false;
  error: {
    issues: Array<{ message: string }>;
  };
};

export type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseFailure;

export interface Schema<T> {
  safeParse(value: unknown): SafeParseResult<T>;
}

export function success<T>(data: T): SafeParseSuccess<T> {
  return { success: true, data };
}

export function failure(message: string): SafeParseFailure {
  return { success: false, error: { issues: [{ message }] } };
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readTrimmedString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function readOptionalTrimmedString(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const trimmed = readTrimmedString(value);
  return trimmed ?? undefined;
}

export function readPositiveInteger(value: unknown, max = Number.POSITIVE_INFINITY) {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(numberValue) || numberValue < 1 || numberValue > max) {
    return null;
  }

  return numberValue;
}