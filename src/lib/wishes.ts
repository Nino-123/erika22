/**
 * Shared rules for birthday wishes. Used by the form (for friendly instant
 * feedback) AND by the API route (the real gatekeeper — never trust the
 * browser).
 */

import { wishesCopy, type WishError } from "@/content/wishes";
import { LIMITS } from "@/lib/wish-limits";

export { LIMITS };

export const MIN_MESSAGE = 2;

export type WishField = keyof typeof LIMITS;

export type WishInput = {
  name: string;
  relationship: string;
  message: string;
  memory: string;
};

/** The shape returned to the browser. Never includes ip hashes or flags. */
export type PublicWish = {
  id: string;
  name: string;
  relationship: string | null;
  message: string;
  memory: string | null;
  created_at: string;
};

// Control characters (keeping \n and \t), zero-width characters and
// bidirectional overrides that can be used to disguise text.
const INVISIBLE = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F​-‏‪-‮⁠-⁤⁦-⁩﻿]/g;

export function clean(value: unknown, multiline = false): string {
  if (typeof value !== "string") return "";
  let s = value.normalize("NFC").replace(/\r\n?/g, "\n").replace(INVISIBLE, "");
  s = multiline
    ? s.replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n")
    : s.replace(/\s+/g, " ");
  return s.trim();
}

const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|ru|xyz|top|info|biz|io|co)\b)/gi;

export type ValidationResult =
  | { ok: true; value: WishInput }
  | { ok: false; errors: Partial<Record<WishField, string>>; codes: Partial<Record<WishField, WishError>> };

export function validateWish(raw: Partial<Record<WishField, unknown>>): ValidationResult {
  const value: WishInput = {
    name: clean(raw.name),
    relationship: clean(raw.relationship),
    message: clean(raw.message, true),
    memory: clean(raw.memory, true),
  };
  const codes: Partial<Record<WishField, WishError>> = {};

  if (!value.name) codes.name = "nameMissing";
  else if (value.name.length > LIMITS.name) codes.name = "nameLong";

  if (value.relationship.length > LIMITS.relationship) codes.relationship = "relationshipLong";

  if (value.message.length < MIN_MESSAGE) codes.message = "messageMissing";
  else if (value.message.length > LIMITS.message) codes.message = "messageLong";

  if (value.memory.length > LIMITS.memory) codes.memory = "memoryLong";

  const links = `${value.name} ${value.message} ${value.memory}`.match(LINK)?.length ?? 0;
  if (links > 0) codes.message = codes.message ?? "links";

  // English messages for the API; the form shows them in the visitor's language via `codes`
  const errors: Partial<Record<WishField, string>> = {};
  for (const [field, code] of Object.entries(codes) as [WishField, WishError][]) errors[field] = wishesCopy.en.errors[code];

  return Object.keys(codes).length ? { ok: false, errors, codes } : { ok: true, value };
}
