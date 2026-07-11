import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";

import { prisma } from "@repo/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const authCookieName = "mc_session";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;

export type SessionUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
};

function authSecret() {
  return process.env.AUTH_SECRET ?? "midnight-creations-dev-secret";
}

function sign(value: string) {
  return createHmac("sha256", authSecret()).update(value).digest("base64url");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) {
    return false;
  }

  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");

  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export function createSessionToken(userId: string) {
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, exp: Date.now() + sessionMaxAgeSeconds * 1000 }),
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
    sub?: string;
    exp?: number;
  };

  if (!parsed.sub || !parsed.exp || Date.now() > parsed.exp) {
    return null;
  }

  return parsed.sub;
}

export function createAuthCookie(token: string) {
  return {
    name: authCookieName,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAgeSeconds,
  };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName)?.value;

  return getCurrentUserFromToken(token);
}

export async function getCurrentUserFromToken(token?: string) {
  if (!token) {
    return null;
  }

  const userId = readSessionToken(token);
  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}