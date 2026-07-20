---
name: Zyntra
description: Direct, tracked, trusted wholesale trade between manufacturers and distributors.
colors:
  navy-dark: "#0c1e31"
  navy: "#0f2743"
  gold: "#eaaa34"
  gold-dark: "#d17a3d"
  white: "#ffffff"
  platinum: "#e5e4e2"
  off-white: "#f2f1ef"
  card-bg: "#e5e4e2"
  border: "#d9d8d5"
  text-primary: "#0f2743"
  text-secondary: "#525c68"
  text-muted: "#556170"
  text-placeholder: "#556170"
  text-faint: "#b2b8bd"
  error: "#d64545"
  success: "#2f9e5b"
  status-in-transit: "#eaaa34"
  status-processing: "#4073cc"
  status-delivered: "#26994d"
  badge-success-bg: "#e0f2e3"
  badge-success-fg: "#1a8040"
  badge-warning-bg: "#fff2db"
  badge-warning-fg: "#ad730f"
  badge-danger-bg: "#fde3e1"
  badge-danger-fg: "#c0392b"
typography:
  display:
    fontFamily: "SpaceGrotesk_700Bold"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 42
    letterSpacing: "normal"
  headline:
    fontFamily: "SpaceGrotesk_700Bold"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 32
  title:
    fontFamily: "SpaceGrotesk_700Bold"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 22
  body:
    fontFamily: "SpaceGrotesk_400Regular"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 20
  label:
    fontFamily: "SpaceGrotesk_600SemiBold"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 17
rounded:
  sm: "4px"
  md: "8px"
  pill: "29px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "26px"
  xxl: "38px"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    height: "50px"
  button-accent:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.navy}"
    rounded: "{rounded.pill}"
    height: "50px"
  button-outline:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    height: "50px"
  chip-active:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    height: "34px"
  chip-inactive:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    height: "34px"
  input-field:
    backgroundColor: "{colors.off-white}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    height: "46px"
  card-product:
    backgroundColor: "{colors.card-bg}"
    rounded: "{rounded.sm}"
    padding: "8px"
---

# Design System: Zyntra

## 1. Overview

**Creative North Star: "The Trade Ledger"**

Zyntra's visual system reads like a well-kept ledger book: deep navy as the ink of record, gold as the mark of value, everything laid out with the discipline of something that has to be trusted. This isn't a consumer shopping app dressed up for wholesale — it's infrastructure for people conducting real trade, and the interface should carry that weight without ever feeling heavy-handed. Bold, uppercase Space Grotesk display type ("BEYOND FACTORY GATES", "HOW WILL YOU USE ZYNTRA?") gives the brand its confident, industrial voice; a restrained platinum body keeps the working screens (browsing, inventory, orders) legible and calm underneath it.

The system explicitly rejects the generic SaaS-dashboard look: no flat gray panels, no interchangeable enterprise-tool chrome. Every surface should feel like it belongs to a single deliberate brand, whether it's a manufacturer's inventory screen or a distributor's tracking view.

**Key Characteristics:**
- Navy-and-gold as the load-bearing palette — navy for structure and trust, gold for value and action
- Bold uppercase Space Grotesk display type for identity moments; the same grotesque at compact working sizes for everything else — dense, ledger-like rhythm
- Platinum (#e5e4e2) as the accent surface for sections and cards — brushed metal next to the navy ink
- Sharp 4px radius as the default component shape — structural, not soft
- Shadows used sparingly and quietly — never a decorative flourish

## 2. Colors

Two-color core (navy + gold) doing almost all of the work, backed by a quiet platinum neutral scale for working surfaces and a handful of semantic accents for status.

### Primary
- **Ledger Navy** (#0f2743): the brand's structural color — primary buttons, headings, icon fills, active states. Also used as `navy-dark` (#0c1e31) for the deepest surfaces (splash background, hero container).

### Secondary
- **Trade Gold** (#eaaa34) / **Gold Dark** (#d17a3d): the accent of value and action — the accent CTA button, active brand moments (the gold word in a two-tone heading), rating badges, price text. Used deliberately, not everywhere — it marks the thing the user should notice or act on.

### Neutral
- **Paper White** (#ffffff): primary screen background, outline-button fill.
- **Off White** (#f2f1ef): input field fill — a platinum-tinted near-white that separates fields from their surrounding screen.
- **Platinum** (#e5e4e2): the accent surface for sections and cards — role selectors, product cards, grouped content. Replaces the old green-tinted Card Gray; it reads as brushed metal next to the navy ink, on brand for an industrial trade tool.
- **Hairline Border** (#d9d8d5): default border color for outline buttons, dividers, unselected radio rings — one step deeper than platinum so hairlines stay visible on platinum cards.
- **Ink Primary** (#0f2743, shared with Ledger Navy): primary text.
- **Ink Secondary** (#525c68): secondary/supporting text.
- **Ink Muted** (#556170): tertiary/deemphasized text. Darkened during the platinum re-tier so it keeps ≥4.5:1 on platinum surfaces, not just white.
- **Ink Placeholder** (#556170): form placeholder text — same contrast reasoning as Ink Muted.
- **Ink Faint** (#b2b8bd): reserved for decorative/non-text use only (large icon fills at 40px+) — it does not meet text contrast and must never carry readable copy. The Divider's "or continue with" label was moved off this tier onto Ink Muted for that reason.

### Semantic
- **Error** (#d64545): form errors, destructive states.
- **Success** (#2f9e5b): general success confirmation.
- **Status — In Transit** (#eaaa34), **Processing** (#4073cc), **Delivered** (#26994d): order-tracking status dots, distinct from the brand gold/navy so status stays scannable at a glance.
- **Badge tints** (success #e0f2e3/#1a8040, warning #fff2db/#ad730f, danger #fde3e1/#c0392b): soft tonal pairs for inline status badges, kept separate from the harder-edged status dots.

### Named Rules
**The Two-Color Rule.** Navy and gold carry the brand identity; every other color in the system is neutral or semantic. If a new UI element needs a color and it isn't structural (navy) or an action/value marker (gold), it belongs in the neutral or semantic tier — never invent a third "brand" hue. Platinum is a neutral surface, not a third brand color.

## 3. Typography

**Display / Body Font:** Space Grotesk (SpaceGrotesk_400Regular through SpaceGrotesk_700Bold), no secondary typeface. The `extraBold` token intentionally maps to the 700 Bold cut — Space Grotesk ships no 800, and its Bold is chunky enough to carry the uppercase display voice.

**Character:** A single grotesque carried across four weights does the work of a type pairing — bold uppercase for declarations, regular/medium/semiBold for everything a user reads while working. The scale runs deliberately compact (one step tighter than a default mobile ramp) to give working screens a dense, ledger-like rhythm.

### Hierarchy
- **Display** (bold 700, 36px / 42px line-height): Full-screen brand statements — the welcome screen's "BEYOND FACTORY GATES." Always uppercase, always short (one word per line).
- **Headline** (bold 700, 26px / 32px): Screen-level headings, e.g. "HOW WILL YOU USE ZYNTRA?" Uppercase, two-tone (navy + gold word) is the signature pattern.
- **Title** (bold 700, 16px / 22px): Card and section titles (role card title, product name at larger sizes).
- **Body** (regular 400, 13px / 20px): Default reading copy — descriptions, subtitles, form values. Cap at ~65-75ch when body text runs in a paragraph.
- **Label** (semiBold 600, 12px / 17px): Form labels, chip text, small UI labels. 11px is the absolute floor for readable text.

### Named Rules
**The Uppercase Declaration Rule.** Bold uppercase type is reserved for identity moments — welcome screens, role/section headlines — never for body copy or buttons beyond a short label. Overusing it flattens its impact.

## 4. Elevation

**Quiet lift.** Zyntra is not a flat system, but its shadows are ambient rather than decorative: a single soft shadow (7% opacity navy, 14px blur, 4px vertical offset) lifts cards just enough to separate them from the page, without ever reading as a "floating panel." Depth signals content grouping, not hierarchy of importance — importance is carried by color and type weight instead.

### Shadow Vocabulary
- **Card lift** (`shadowColor: #0f2643, shadowOpacity: 0.07, shadowRadius: 14, shadowOffset: {0, 4}, elevation: 2`): the only shadow in the system. Used on product cards and equivalent grouped-content surfaces.

### Named Rules
**The One Shadow Rule.** There is exactly one elevation value in this system. Don't introduce a second, heavier shadow for "more important" cards — importance is a color/type problem, not a depth problem.

## 5. Components

Components are solid and deliberate: full-bleed navy or gold fills, a consistently sharp 4px radius (not soft rounded corners), 1.5px borders where borders appear at all. Control heights run one step tighter than a default mobile kit (50px buttons, 46px fields, 34px chips) for a dense but fluid working rhythm — all still comfortably above the 44pt touch floor for primary controls. The one intentional break from the sharp-radius rule is the accent CTA button, which goes fully pill-shaped (29px radius) to mark it as the single most important action on a screen.

### Buttons
- **Shape:** 4px radius (`rounded.sm`) by default; the accent variant is a full pill (29px radius) — reserved for the single primary CTA on a screen (e.g. "Get Started").
- **Primary:** navy fill (#0f2743), white label, 50px height.
- **Accent:** gold fill (#eaaa34), navy label, pill radius, 50px height. Use for the one CTA that matters most on the screen.
- **Outline:** white fill, 1.5px hairline border (#d9d8d5), primary-ink label. Use for secondary actions alongside a primary/accent button.
- **States:** disabled = 0.5 opacity; pressed = 0.85 opacity. No color-shift hover states (touch-first platform).

### Chips
- **Style:** 4px radius, 1.5px border, 34px height, horizontal padding 16px.
- **State:** active = navy fill / white text; inactive = white fill / ink-primary text with hairline border. Gold stays reserved for the single most important action/value on a screen.

### Cards
- **Corner style:** 4px radius.
- **Background:** Platinum (#e5e4e2) for product/role/section cards on white screens.
- **Shadow strategy:** the single "Card lift" shadow (see Elevation) on product cards; role-selection cards use a border state instead of a shadow to show selection (gold 1.5px border when active).
- **Internal padding:** 8px (compact product cards) up to 16px (role cards with more content).

### Inputs / Fields
- **Style:** Off White fill (#f2f1ef), 1.5px hairline border, 4px radius, 46px height (92px for multiline).
- **Focus/Error:** error state swaps the border to Error red (#d64545); no distinct focus-ring treatment currently — border-color is the only state signal besides content.
- **Icons:** left icon slot and a right-aligned secure-entry toggle (eye/eye-slash, using muted/gold icon colors) are built into the field, not bolted on separately.

### Badges & Status
- **Badges:** solid-fill for brand variants (gold/navy), soft tonal pairs for semantic variants (success/warning/danger) — bold 10px uppercase-weight label, 4px radius pill-adjacent rectangle.
- **Status dots:** 10px circle, one of three status colors (in-transit gold, processing blue, delivered green) — used wherever an order status needs a fast visual scan without reading text.

### Navigation
- Screens are composed with `ScreenContainer` (safe-area aware, full-bleed background) rather than a persistent chrome-heavy nav bar; role-based flows (manufacturer/distributor) branch at the router level, keeping each surface focused on its role's task rather than a shared generic shell.

## 6. Do's and Don'ts

### Do:
- **Do** keep the palette to navy + gold as the only two brand colors; everything else is neutral or semantic (see The Two-Color Rule).
- **Do** use platinum (#e5e4e2) as the one surface color for cards and grouped sections; don't invent per-screen surface tints.
- **Do** use the 4px sharp radius as the default component shape; save the pill radius for the one accent CTA per screen.
- **Do** use bold uppercase type only for identity-level headlines, not body copy or routine buttons (The Uppercase Declaration Rule).
- **Do** keep elevation to the single quiet card-lift shadow; signal importance through color/type, not deeper shadows (The One Shadow Rule).
- **Do** meet WCAG AA contrast (≥4.5:1 body, ≥3:1 large text) and ≥44×44pt touch targets, per PRODUCT.md's accessibility commitment.

### Don't:
- **Don't** build flat, gray, interchangeable enterprise-SaaS-dashboard panels — PRODUCT.md names this directly as the anti-reference; every surface should read as Zyntra's own ledger-and-trade system, not generic admin tooling.
- **Don't** reach for e-commerce/shopping-cart visual tropes (large lifestyle imagery, "add to bag" playfulness) — this is B2B wholesale trade, not consumer retail.
- **Don't** introduce a third brand hue outside navy/gold, or a second shadow depth beyond the single card-lift value.
- **Don't** set readable text below 11px, or use light gray body text — Zyntra's text ramp bottoms out at Ink Faint (#b2b8bd) for decorative use only, never for copy that needs to be read.
