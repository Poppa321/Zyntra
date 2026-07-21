export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 32,
} as const;

// Bumped from a 4px "sharp ledger" radius to a softer 10/14px scale — still
// deliberate and structural, just less rigid. Circular avatars/icon buttons
// are sized to half their own diameter and are NOT driven by these tokens.
export const radius = {
  sm: 10,
  md: 14,
  pill: 29,
} as const;

export const cardShadow = {
  shadowColor: "#0f2643",
  shadowOpacity: 0.07,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const;
