---
name: Zyntra
description: Direct, tracked, trusted wholesale trade between manufacturers and distributors.
colors:
  navy-dark: "#0c1e31"
  navy: "#0f2743"
  gold: "#eaaa34"
  gold-dark: "#d17a3d"
  white: "#ffffff"
  off-white: "#f5f6f4"
  card-bg: "#f1f2ee"
  border: "#ebede9"
  text-primary: "#0f2743"
  text-secondary: "#5c6673"
  text-muted: "#5f6b7a"
  text-placeholder: "#5f6b7a"
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
    fontFamily: "Inter_800ExtraBold"
    fontSize: "44px"
    fontWeight: 800
    lineHeight: 52
    letterSpacing: "normal"
  headline:
    fontFamily: "Inter_800ExtraBold"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 38
  title:
    fontFamily: "Inter_700Bold"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 24
  body:
    fontFamily: "Inter_400Regular"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 22
  label:
    fontFamily: "Inter_600SemiBold"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 18
rounded:
  sm: "4px"
  md: "8px"
  pill: "29px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    height: "56px"
  button-accent:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.navy}"
    rounded: "{rounded.pill}"
    height: "56px"
  button-outline:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    height: "56px"
  chip-active:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    height: "38px"
  chip-inactive:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    height: "38px"
  input-field:
    backgroundColor: "{colors.off-white}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    height: "52px"
  card-product:
    backgroundColor: "{colors.card-bg}"
    rounded: "{rounded.sm}"
    padding: "8px"
---

# Design System: Zyntra

## 1. Overview

**Creative North Star: "The Trade Ledger"**

Zyntra's visual system reads like a well-kept ledger book: deep navy as the ink of record, gold as the mark of value, everything laid out with the discipline of something that has to be trusted. This isn't a consumer shopping app dressed up for wholesale — it's infrastructure for people conducting real trade, and the interface should carry that weight without ever feeling heavy-handed. Bold, uppercase extraBold display type ("BEYOND FACTORY GATES", "HOW WILL YOU USE ZYNTRA?") gives the brand its confident, industrial voice; a restrained off-white/card-gray body keeps the working screens (browsing, inventory, orders) legible and calm underneath it.

The system explicitly rejects the generic SaaS-dashboard look: no flat gray panels, no interchangeable enterprise-tool chrome. Every surface should feel like it belongs to a single deliberate brand, whether it's a manufacturer's inventory screen or a distributor's tracking view.

**Key Characteristics:**
- Navy-and-gold as the load-bearing palette — navy for structure and trust, gold for value and action
- Bold extraBold uppercase display type for identity moments; restrained Inter body copy for working screens
- Sharp 4px radius as the default component shape — structural, not soft
- Shadows used sparingly and quietly — never a decorative flourish

## 2. Colors

Two-color core (navy + gold) doing almost all of the work, backed by a quiet neutral scale for working surfaces and a handful of semantic accents for status.

### Primary
- **Ledger Navy** (#0f2743): the brand's structural color — primary buttons, headings, icon fills, active states. Also used as `navy-dark` (#0c1e31) for the deepest surfaces (splash background, hero container).

### Secondary
- **Trade Gold** (#eaaa34) / **Gold Dark** (#d17a3d): the accent of value and action — the accent CTA button, active brand moments (the gold word in a two-tone heading), rating badges, price text. Used deliberately, not everywhere — it marks the thing the user should notice or act on.

### Neutral
- **Paper White** (#ffffff): primary screen background, outline-button fill.
- **Off White** (#f5f6f4): input field fill — a hair darker than pure white to separate fields from their surrounding screen.
- **Card Gray** (#f1f2ee): card and role-selector backgrounds.
- **Hairline Border** (#ebede9): default border color for outline buttons, dividers, unselected radio rings.
- **Ink Primary** (#0f2743, shared with Ledger Navy): primary text.
- **Ink Secondary** (#5c6673): secondary/supporting text.
- **Ink Muted** (#5f6b7a): tertiary/deemphasized text. Darkened from the original #8c9eb2 during polish — the original failed WCAG AA (2.7:1 on white); this hits ~5.4:1.
- **Ink Placeholder** (#5f6b7a): form placeholder text. Same fix as Ink Muted — the original #99a1a8 measured ~2.4:1 against the off-white field fill, well under the 4.5:1 placeholder text needs.
- **Ink Faint** (#b2b8bd): reserved for decorative/non-text use only (large icon fills at 40px+) — it does not meet text contrast and must never carry readable copy. The Divider's "or continue with" label was moved off this tier onto Ink Muted for that reason.

### Semantic
- **Error** (#d64545): form errors, destructive states.
- **Success** (#2f9e5b): general success confirmation.
- **Status — In Transit** (#eaaa34), **Processing** (#4073cc), **Delivered** (#26994d): order-tracking status dots, distinct from the brand gold/navy so status stays scannable at a glance.
- **Badge tints** (success #e0f2e3/#1a8040, warning #fff2db/#ad730f, danger #fde3e1/#c0392b): soft tonal pairs for inline status badges, kept separate from the harder-edged status dots.

### Named Rules
**The Two-Color Rule.** Navy and gold carry the brand identity; every other color in the system is neutral or semantic. If a new UI element needs a color and it isn't structural (navy) or an action/value marker (gold), it belongs in the neutral or semantic tier — never invent a third "brand" hue.

## 3. Typography

**Display / Body Font:** Inter (Inter_400Regular through Inter_800ExtraBold), no secondary typeface.

**Character:** A single geometric-humanist sans carried across five weights does the work of a type pairing — extraBold uppercase for declarations, regular/medium/semiBold for everything a user reads while working. The system leans on weight and size contrast, not font-family contrast.

### Hierarchy
- **Display** (extraBold 800, 44px / 52px line-height): Full-screen brand statements — the welcome screen's "BEYOND FACTORY GATES." Always uppercase, always short (one word per line).
- **Headline** (extraBold 800, 30px / 38px): Screen-level headings, e.g. "HOW WILL YOU USE ZYNTRA?" Uppercase, two-tone (navy + gold word) is the signature pattern.
- **Title** (bold 700, 18px / 24px): Card and section titles (role card title, product name at larger sizes).
- **Body** (regular 400, 14px / 22px): Default reading copy — descriptions, subtitles, form values. Cap at ~65-75ch when body text runs in a paragraph.
- **Label** (semiBold 600, 13px / 18px): Form labels, chip text, small UI labels.

### Named Rules
**The Uppercase Declaration Rule.** ExtraBold uppercase type is reserved for identity moments — welcome screens, role/section headlines — never for body copy or buttons beyond a short label. Overusing it flattens its impact.

## 4. Elevation

**Quiet lift.** Zyntra is not a flat system, but its shadows are ambient rather than decorative: a single soft shadow (7% opacity navy, 14px blur, 4px vertical offset) lifts cards just enough to separate them from the page, without ever reading as a "floating panel." Depth signals content grouping, not hierarchy of importance — importance is carried by color and type weight instead.

### Shadow Vocabulary
- **Card lift** (`shadowColor: #0f2643, shadowOpacity: 0.07, shadowRadius: 14, shadowOffset: {0, 4}, elevation: 2`): the only shadow in the system. Used on product cards and equivalent grouped-content surfaces.

### Named Rules
**The One Shadow Rule.** There is exactly one elevation value in this system. Don't introduce a second, heavier shadow for "more important" cards — importance is a color/type problem, not a depth problem.

## 5. Components

Components are solid and deliberate: full-bleed navy or gold fills, a consistently sharp 4px radius (not soft rounded corners), 1.5px borders where borders appear at all. The one intentional break from the sharp-radius rule is the accent CTA button, which goes fully pill-shaped (29px radius) to mark it as the single most important action on a screen.

### Buttons
- **Shape:** 4px radius (`rounded.sm`) by default; the accent variant is a full pill (29px radius) — reserved for the single primary CTA on a screen (e.g. "Get Started").
- **Primary:** navy fill (#0f2743), white label, 56px height.
- **Accent:** gold fill (#eaaa34), navy label, pill radius, 56px height. Use for the one CTA that matters most on the screen.
- **Outline:** white fill, 1.5px hairline border (#ebede9), primary-ink label. Use for secondary actions alongside a primary/accent button.
- **States:** disabled = 0.5 opacity; pressed = 0.85 opacity. No color-shift hover states (touch-first platform).

### Chips
- **Style:** 4px radius, 1.5px border, 38px height, horizontal padding 16px.
- **State:** active = navy fill / white text; inactive = white fill / ink-primary text with hairline border. Inactive chips were originally gold-filled, but a full-saturation gold on every unselected chip in a category row breaks the Two-Color Rule's "gold marks the one thing" intent and the product register's ban on heavy color on inactive states — fixed during polish to keep gold reserved for the single most important action/value on a screen.

### Cards
- **Corner style:** 4px radius.
- **Background:** Card Gray (#f1f2ee) for product/role cards on white screens.
- **Shadow strategy:** the single "Card lift" shadow (see Elevation) on product cards; role-selection cards use a border state instead of a shadow to show selection (gold 1.5px border when active).
- **Internal padding:** 8px (compact product cards) up to 20px (role cards with more content).

### Inputs / Fields
- **Style:** Off White fill (#f5f6f4), 1.5px hairline border, 4px radius, 52px height (92px for multiline).
- **Focus/Error:** error state swaps the border to Error red (#d64545); no distinct focus-ring treatment currently — border-color is the only state signal besides content.
- **Icons:** left icon slot and a right-aligned secure-entry toggle (eye/eye-slash, using muted/gold icon colors) are built into the field, not bolted on separately.

### Badges & Status
- **Badges:** solid-fill for brand variants (gold/navy), soft tonal pairs for semantic variants (success/warning/danger) — extraBold 10px uppercase-weight label, 4px radius pill-adjacent rectangle.
- **Status dots:** 10px circle, one of three status colors (in-transit gold, processing blue, delivered green) — used wherever an order status needs a fast visual scan without reading text.

### Navigation
- Screens are composed with `ScreenContainer` (safe-area aware, full-bleed background) rather than a persistent chrome-heavy nav bar; role-based flows (manufacturer/distributor) branch at the router level, keeping each surface focused on its role's task rather than a shared generic shell.

## 6. Do's and Don'ts

### Do:
- **Do** keep the palette to navy + gold as the only two brand colors; everything else is neutral or semantic (see The Two-Color Rule).
- **Do** use the 4px sharp radius as the default component shape; save the pill radius for the one accent CTA per screen.
- **Do** use extraBold uppercase type only for identity-level headlines, not body copy or routine buttons (The Uppercase Declaration Rule).
- **Do** keep elevation to the single quiet card-lift shadow; signal importance through color/type, not deeper shadows (The One Shadow Rule).
- **Do** meet WCAG AA contrast (≥4.5:1 body, ≥3:1 large text) and ≥44×44pt touch targets, per PRODUCT.md's accessibility commitment.

### Don't:
- **Don't** build flat, gray, interchangeable enterprise-SaaS-dashboard panels — PRODUCT.md names this directly as the anti-reference; every surface should read as Zyntra's own ledger-and-trade system, not generic admin tooling.
- **Don't** reach for e-commerce/shopping-cart visual tropes (large lifestyle imagery, "add to bag" playfulness) — this is B2B wholesale trade, not consumer retail.
- **Don't** introduce a third brand hue outside navy/gold, or a second shadow depth beyond the single card-lift value.
- **Don't** use light gray body text for anything readable — Zyntra's text ramp bottoms out at Ink Faint (#b2b8bd) for the least important labels only, never for body copy that needs to be read.
