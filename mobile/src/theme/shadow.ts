import type { ThemeColors } from "@/theme/ThemeContext";

// The One Shadow Rule (DESIGN.md): exactly one elevation value in the
// system — a quiet "card lift" that separates grouped content from the
// page. Import this instead of hand-rolling shadow numbers per screen;
// importance is a color/type problem, not a deeper-shadow problem.
export function cardShadow(colors: ThemeColors) {
  return {
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  } as const;
}
