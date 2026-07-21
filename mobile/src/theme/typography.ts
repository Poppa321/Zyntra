// Noto Sans ships 100–900, but only 400–700 are loaded; "extraBold" intentionally
// maps to Bold — no heavier cut is loaded for the uppercase display voice.
export const fonts = {
  regular: "NotoSans_400Regular",
  medium: "NotoSans_500Medium",
  semiBold: "NotoSans_600SemiBold",
  bold: "NotoSans_700Bold",
  extraBold: "NotoSans_700Bold",
} as const;
