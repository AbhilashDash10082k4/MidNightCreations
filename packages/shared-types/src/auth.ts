import {
  failure,
  isPlainObject,
  readOptionalTrimmedString,
  readTrimmedString,
  success,
  type Schema,
} from "./schema";

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  firstName?: string;
  lastName?: string;
};

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 320;
}

function isStrongPassword(value: string) {
  return value.length >= 8 && value.length <= 128;
}

export const loginSchema: Schema<LoginInput> = {
  safeParse(value: unknown) {
    if (!isPlainObject(value)) {
      return failure("Invalid login payload.");
    }

    const email = readTrimmedString(value.email);
    const password = readTrimmedString(value.password);

    if (!email || !isEmail(email)) {
      return failure("Invalid email address.");
    }

    if (!password || !isStrongPassword(password)) {
      return failure("Password must be at least 8 characters.");
    }

    return success({ email, password });
  },
};

export const registerSchema: Schema<RegisterInput> = {
  safeParse(value: unknown) {
    if (!isPlainObject(value)) {
      return failure("Invalid registration payload.");
    }

    const email = readTrimmedString(value.email);
    const password = readTrimmedString(value.password);
    const firstName = readOptionalTrimmedString(value.firstName);
    const lastName = readOptionalTrimmedString(value.lastName);

    if (!email || !isEmail(email)) {
      return failure("Invalid email address.");
    }

    if (!password || !isStrongPassword(password)) {
      return failure("Password must be at least 8 characters.");
    }

    return success({ email, password, firstName, lastName });
  },
};
