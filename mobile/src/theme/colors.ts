export const colors = {
  navyDark: "#0c1e31",
  navy: "#0f2743",
  gold: "#eaaa34",
  goldDark: "#d17a3d",

  white: "#ffffff",
  // Fixed white — for text/icons on brand-constant surfaces (navy, gold)
  // that never invert with theme. Unlike `white`, this never changes value:
  // `white` is a page-surface role that intentionally flips near-black in
  // dark mode, which is correct for backgrounds but wrong for foreground
  // ink pinned to a navy/gold chip, button, or hero.
  pureWhite: "#ffffff",
  // Platinum neutral tier: platinum is now a deeper accent tone reserved for
  // emphasis (selected states, dense navy-adjacent chrome); everyday cards and
  // sections sit on cardBg, a much lighter near-white tint one step off the
  // screen white — enough to separate from the page without reading as a block.
  platinum: "#e5e4e2",
  offWhite: "#f2f1ef",
  cardBg: "#f7f6f4",
  // A visibly-tinted gold wash — noticeably darker than cardBg's near-white
  // tint, for surfaces that want the brand accent rather than a neutral card
  // fill (e.g. incoming-order rows, where a quiet accent helps them stand
  // apart from plain list rows).
  accentTint: "rgba(234,170,52,0.16)",
  border: "#d9d8d5",

  textPrimary: "#0f2743",
  textSecondary: "#525c68",
  textMuted: "#556170",
  textPlaceholder: "#556170",
  textFaint: "#b2b8bd",

  error: "#d64545",
  errorMuted: "rgba(214,69,69,0.08)",
  success: "#2f9e5b",
} as const;
