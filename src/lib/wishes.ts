/**
 * Shared rules for birthday wishes. Used by the form (for friendly instant
 * feedback) AND by the API route (the real gatekeeper — never trust the
 * browser).
 */

export const LIMITS = {
  name: 60,
  relationship: 60,
  message: 1000,
  memory: 300,
} as const;

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
  | { ok: false; errors: Partial<Record<WishField, string>> };

export function validateWish(raw: Partial<Record<WishField, unknown>>): ValidationResult {
  const value: WishInput = {
    name: clean(raw.name),
    relationship: clean(raw.relationship),
    message: clean(raw.message, true),
    memory: clean(raw.memory, true),
  };
  const errors: Partial<Record<WishField, string>> = {};

  if (!value.name) errors.name = "Please tell her who this is from.";
  else if (value.name.length > LIMITS.name) errors.name = `Please keep your name under ${LIMITS.name} characters.`;

  if (value.relationship.length > LIMITS.relationship)
    errors.relationship = `Please keep this under ${LIMITS.relationship} characters.`;

  if (value.message.length < MIN_MESSAGE) errors.message = "Please write her a little message.";
  else if (value.message.length > LIMITS.message)
    errors.message = `Please keep your message under ${LIMITS.message} characters.`;

  if (value.memory.length > LIMITS.memory) errors.memory = `Please keep this under ${LIMITS.memory} characters.`;

  const links = `${value.name} ${value.message} ${value.memory}`.match(LINK)?.length ?? 0;
  if (links > 0) errors.message = errors.message ?? "Links can't be included in wishes — just your words, please.";

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}
