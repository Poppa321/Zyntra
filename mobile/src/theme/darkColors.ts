// Dark counterpart of theme/colors.ts. Rebuilt off the brand's own navy hue
// instead of a generic slate ramp, so dark mode still reads as Zyntra rather
// than a stock admin-tool dark theme. Three distinct surface steps
// (offWhite < cardBg < white) give real depth between page, card, and
// elevated-sheet surfaces — the previous ramp collapsed cardBg and white to
// the same value, which is why cards never separated from the page.
export const darkColors = {
  navyDark: "#080f1a", // deepest navy-black backdrop (splash/hero)
  navy: "#17324e", // lifted navy — brighter than the backdrop so navy fills/buttons still read as a distinct surface, not camouflage
  gold: "#f5a623", // vibrant premium amber gold
  goldDark: "#d9861f",

  white: "#16283f", // elevated sheet/modal surface — one step above cardBg
  pureWhite: "#ffffff",
  platinum: "#2d4c6e", // deeper accent tone for emphasis (icon wells, quick-action tiles)
  offWhite: "#0a1420", // deepest general page backdrop
  cardBg: "#122237", // everyday card surface — distinct from both offWhite and white
  accentTint: "rgba(245,166,35,0.16)",
  border: "#2a4360",

  textPrimary: "#f5f8fb",
  textSecondary: "#c5cedb",
  textMuted: "#93a1b4",
  textPlaceholder: "#6d7c90",
  textFaint: "#4b5a70",

  error: "#f8776c",
  errorMuted: "rgba(248,119,108,0.16)",
  success: "#3ddc93",
} as const;
