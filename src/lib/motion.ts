/**
 * Motion identity for the whole site ("Premium" personality):
 * one signature curve, a three-step duration palette, and stagger budgets
 * that keep any cascade under ~600ms so nothing feels like it's waiting.
 */

/** Signature entrance curve — fast start, long gentle landing. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
/** Exits accelerate away. */
export const EASE_IN = [0.4, 0, 1, 1] as const;
/** On-screen / ambient moves. */
export const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const;

export const DUR = {
  quick: 0.2,
  standard: 0.5,
  slow: 0.9,
  /** Theatrical reveals (hero headline, the bloom). */
  reveal: 1.2,
} as const;

export const STAGGER = {
  micro: 0.03,
  standard: 0.07,
  dramatic: 0.12,
} as const;

/** Keeps a word/element cascade inside the total budget. */
export function staggerWithin(count: number, preferred: number, budget = 0.6) {
  return count > 1 ? Math.min(preferred, budget / (count - 1)) : 0;
}
