export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 32,
} as const;

// Bumped again for a more modern, premium feel — softer 16/22px scale.
// Circular avatars/icon buttons are sized to half their own diameter and
// are NOT driven by these tokens.
export const radius = {
  sm: 16,
  md: 22,
  pill: 999,
  // Cards are capped sharper than interactive elements (buttons, inputs) —
  // a deliberate "ledger" contrast, not an oversight; don't reuse this for
  // non-card surfaces.
  card: 26,
} as const;
