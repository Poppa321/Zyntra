// Dark counterpart of theme/colors.ts. Brand colors (navy/gold) stay put —
// only surface and text roles flip, so the two-color brand identity holds in
// both appearances.
export const darkColors = {
  navyDark: "#0c1e31",
  navy: "#17385c",
  gold: "#eaaa34",
  goldDark: "#d17a3d",

  white: "#0b1626",
  pureWhite: "#ffffff",
  platinum: "#1c3958",
  offWhite: "#122842",
  cardBg: "#132a44",
  accentTint: "rgba(234,170,52,0.14)",
  border: "#294863",

  textPrimary: "#f5f4f2",
  textSecondary: "#c3cbd4",
  textMuted: "#96a2ae",
  textPlaceholder: "#96a2ae",
  textFaint: "#5c6875",

  error: "#ef6a63",
  errorMuted: "rgba(239,106,99,0.14)",
  success: "#3fbd77",
} as const;
