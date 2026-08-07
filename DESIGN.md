---
version: alpha
name: Hello Pomelo
description: Design system for the Tech Lead assessment dashboard - Hello Pomelo brand adapted to an operational product shell.
colors:
  primary: "#11103B"
  on-primary: "#FFFFFF"
  primary-light: "#1F73E0"
  secondary: "#D9306B"
  on-secondary: "#FFFFFF"
  tertiary: "#FFDE34"
  on-tertiary: "#11103B"
  background: "#FFFEFA"
  on-background: "#090A0C"
  surface: "#FFFFFF"
  on-surface: "#090A0C"
  surface-muted: "#F8F7F6"
  neutral: "#F6F6F6"
  neutral-dark: "#B3B3B3"
  muted: "#3C3C3B"
  outline: "#BCBCB9"
  destructive: "#C62828"
  on-destructive: "#FFFFFF"
  anomaly: "#D9306B"
  anomaly-soft: "#FCE8EF"
  success: "#1B7F4E"
  success-soft: "#E6F5EE"
typography:
  display:
    fontFamily: Syne
    fontSize: 2.25rem
    fontWeight: "700"
    lineHeight: 1.15
    letterSpacing: -0.02em
  h1:
    fontFamily: Syne
    fontSize: 1.875rem
    fontWeight: "700"
    lineHeight: 1.2
    letterSpacing: -0.02em
  h2:
    fontFamily: Syne
    fontSize: 1.5rem
    fontWeight: "600"
    lineHeight: 1.25
  h3:
    fontFamily: Syne
    fontSize: 1.125rem
    fontWeight: "600"
    lineHeight: 1.35
  body-lg:
    fontFamily: Manrope
    fontSize: 1.125rem
    fontWeight: "400"
    lineHeight: 1.6
  body-md:
    fontFamily: Manrope
    fontSize: 1rem
    fontWeight: "400"
    lineHeight: 1.55
  body-sm:
    fontFamily: Manrope
    fontSize: 0.875rem
    fontWeight: "400"
    lineHeight: 1.5
  label-caps:
    fontFamily: Manrope
    fontSize: 0.75rem
    fontWeight: "600"
    lineHeight: 1
    letterSpacing: 0.06em
  mono:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: "400"
    lineHeight: 1.4
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  sidebar-width: 16rem
  header-height: 3.5rem
  content-padding: 1rem
components:
  button-primary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 12px
  button-primary-hover:
    backgroundColor: "#B8255A"
  button-secondary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 12px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
  sidebar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
  sidebar-active:
    backgroundColor: "{colors.anomaly-soft}"
    textColor: "{colors.secondary}"
  header:
    backgroundColor: "rgba(255, 254, 250, 0.7)"
    textColor: "{colors.muted}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  badge-anomaly:
    backgroundColor: "{colors.anomaly-soft}"
    textColor: "{colors.anomaly}"
    rounded: "{rounded.full}"
    padding: 8px
  badge-ok:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    rounded: "{rounded.full}"
    padding: 8px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 12px
---

## Overview

Hello Pomelo is a B2B tech partner brand: sovereign, sharp, and operational. The assessment dashboard inherits that identity - navy authority, magenta action, cream surfaces - inside a product shell optimized for CRM-style reporting rather than a marketing landing page.

The visual direction is **operational clarity with brand presence**: dense enough for metrics and order tables, warm enough to feel branded, never decorative for its own sake.

Brand fonts on the public site (Archia, Articulat CF, Fustat) are proprietary. This system uses **Syne** (display) and **Manrope** (UI body) as licensed Google Fonts stand-ins with a similar geometric / humanist balance. **JetBrains Mono** is reserved for order IDs and monetary figures.

## Colors

The palette is taken from [hello-pomelo.com](https://hello-pomelo.com/) CSS tokens and adapted for an app chrome.

- **Primary (#11103B):** Deep navy for sidebar emphasis, headings, and structural UI. Conveys trust and SI / enterprise gravity.
- **Primary light (#1F73E0):** Secondary interactive blue for links and focus rings when magenta would over-signal.
- **Secondary (#D9306B):** Magenta - the sole high-energy brand accent for primary CTAs, active nav, and anomaly flags.
- **Tertiary (#FFDE34):** Pomelo yellow - sparingly for highlights, empty-state accents, or chart callouts. Never as large backgrounds.
- **Background (#FFFEFA) / Surface muted (#F8F7F6):** Warm off-whites instead of pure white, matching the site’s light canvas.
- **Muted (#3C3C3B) / Outline (#BCBCB9):** Neutral hierarchy for captions, borders, and separators.
- **Anomaly soft (#FCE8EF):** Magenta-tinted surface for anomaly badges without shouting.

Do not introduce purple-indigo gradient themes, glow effects, or dark-mode-first defaults. Light mode is the default product experience.

## Typography

- **Syne** for page titles and section headings - slightly expressive, brand-adjacent, never default Inter/Roboto/Arial.
- **Manrope** for body, labels, tables, and forms - highly legible at small sizes in dense dashboards.
- **JetBrains Mono** for order numbers, cents/euros display, and technical identifiers.
- Uppercase micro-labels (`label-caps`) mark period granularity and metric captions; keep letter-spacing modest (0.06em).

## Layout

The shell mirrors a known product pattern: **inset sidebar + sticky header + muted content well**.

- Base spacing unit: 8px (`spacing.sm`).
- Content padding: 16px (`spacing.md` / `content-padding`), increasing on large screens via the shell CSS variables.
- Sidebar width ~16rem when expanded; collapses to icon mode.
- One job per view: Q1 is a customer-history report - search/select customer, then periods and orders. Avoid marketing hero sections inside the dashboard.

Prefer full-width operational layouts over centered marketing containers.

## Elevation & Depth

Keep elevation quiet and functional:

- Cards sit on white surfaces over the muted cream well (`surface-muted` / `bg-muted`).
- Sidebar and inset main panel use subtle borders (`outline`) rather than multi-layer shadows.
- Header uses a light blur + translucent background (`rgba(255, 254, 250, 0.7)`) so content can scroll underneath without competing chrome.
- No neon glows, no heavy drop shadows on cards.

## Shapes

- Controls and inputs: `rounded.md` (8px).
- Cards and inset panels: `rounded.lg` (12px).
- Badges and pills only where they encode state (anomaly / status) - not as decorative chrome.
- Avoid `rounded-full` on large containers or primary layout regions.

## Components

### Buttons

Primary actions use magenta (`secondary`). Secondary structural actions may use navy (`primary`). Ghost buttons are for low-emphasis actions in toolbars.

### Sidebar & header

Active nav uses soft magenta background + magenta text. Inactive items stay muted navy/grey. Header title is quiet metadata (“Customer History”), not a second brand lockup - the sidebar logo carries the brand.

### Cards & tables

History periods and order rows live in clear tables or sectioned lists. Prefer borders and typography hierarchy over nested cards. Cards are allowed when they group a selectable period summary the user interacts with.

### Anomaly badge

Orders flagged as anomalies use `badge-anomaly` (soft magenta fill). Do not rely on color alone - include text such as “Anomalie” and, when useful, the direction (haut / bas).

## Do's and Don'ts

**Do**

- Lead with navy + magenta + cream; yellow only as accent.
- Keep business metrics scannable: mono for money, clear period labels.
- Preserve the inset sidebar shell across Q1/Q2 screens for continuity.
- Document font substitutions when brand webfonts are unavailable.

**Don't**

- Don’t rebuild the marketing site inside the dashboard.
- Don’t use purple-on-white AI-default themes or cream/serif/terracotta broadsheet tropes.
- Don’t put floating promo badges or hero overlays on operational screens.
- Don’t hide anomaly state behind icon-only affordances without a text label.
