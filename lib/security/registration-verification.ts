import "server-only";

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

function verificationSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required.");
  return secret;
}

export function createRegistrationCode() {
  return randomInt(100000, 1000000).toString();
}

export function hashRegistrationCode(userId: string, code: string) {
  return createHmac("sha256", verificationSecret())
    .update(`registration:${userId}:${code}`)
    .digest("hex");
}

export function registrationCodeMatches(userId: string, code: string, expectedHash: string) {
  const actual = Buffer.from(hashRegistrationCode(userId, code), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
