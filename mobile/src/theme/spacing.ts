export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 32,
} as const;

// Unified at 14 across the board — one corner radius for the whole site
// (buttons, inputs, chips, hero banners, cards) rather than a stepped scale.
// `pill` stays a distinct shape (fully rounded), reserved for the one accent
// CTA per screen — not part of this radius scale. Circular avatars/icon
// buttons are sized to half their own diameter and are NOT driven by these
// tokens either.
export const radius = {
  sm: 14,
  md: 14,
  pill: 999,
  card: 14,
} as const;
