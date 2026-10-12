/** Maximum lengths for each part of a wish (shared by the form, the copy and the API). */
export const LIMITS = {
  name: 60,
  relationship: 60,
  message: 1000,
  memory: 300,
} as const;
