# Design System Inspired by Speako

> Auto-extracted from `https://speako.framer.website/` on 2026-06-22

## 1. Visual Theme & Atmosphere

Friendly, approachable design with rounded shapes and generous whitespace.

The hero section leads with "Boost Your English Skills".

**Key Characteristics:**
- Bricolage Grotesque as the heading font (custom web font loaded via @font-face)
- sans-serif as the body font for all running text
- Heading weight 600, letter-spacing -1.28px
- Light/white background (#ffffff) as the primary canvas
- Primary accent `#451af5` used for CTAs and brand highlights
- 1 shadow level(s) detected — tinted shadows
- Rounded corners (50px+) creating a friendly, approachable feel
- Tags: light, rounded, accented, sans-serif

## 2. Color Palette & Roles

### Primary
- **Primary Accent** (`#451af5`) · `--color-primary`: Brand color, CTA backgrounds, link text, interactive highlights.
- **Secondary Accent** (`#06792a`) · `--color-secondary`: Secondary brand, hover states, complementary highlights.
- **Background** (`#ffffff`) · `--color-bg`: Page background, primary canvas.
- **Background Secondary** (`#451af5`) · `--color-bg-secondary`: Cards, surfaces, alternating sections.

### Text
- **Text Primary** (`#000000`) · `--color-text`: Headings and body text.
- **Text Secondary** (`#666666`) · `--color-text-secondary`: Muted text, captions, placeholders.

### Borders & Surfaces
- **Border** (`#fbfaff`) · `--color-border`: Dividers, outlines, input borders.

### Full Extracted Palette

| # | Hex | CSS Variable | Role | Area | Contrast |
|---|---|---|---|---|---|
| 1 | `#ffffff` | `--palette-1` | block | large | text-dark |
| 2 | `#451af5` | `--palette-2` | button | large | text-light |
| 3 | `#000000` | `--palette-3` | section | large | text-light |
| 4 | `#0000ee` | `--palette-4` | text-accent | small | text-light |
| 5 | `#06792a` | `--palette-5` | button | small | text-light |

## 3. Typography Rules

- **Heading Font:** `Bricolage Grotesque` (web font)
- **Body Font:** `sans-serif`, sans-serif

### Type Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| H1 | Bricolage Grotesque | 64px | 600 | 71.68px | -1.28px |
| H2 | Bricolage Grotesque | 48px | 600 | 57.6px | -0.48px |
| H3 | Bricolage Grotesque | 24px | 600 | 29.76px | -0.24px |
| H4 | Bricolage Grotesque | 18px | 600 | 24.48px | normal |
| Body | Bricolage Grotesque | 18px | 500 | 24.48px | normal |

### Type Scale

| Token | Size | Suggested Usage |
|---|---|---|
| Display | `64px` | headings |
| H1 | `56px` | headings |
| H2 | `48px` | headings |
| H3 | `24px` | headings |
| H4 | `18px` | headings |
| Body L | `16px` | body / supporting text |
| Body | `14px` | body / supporting text |
| Small | `12px` | body / supporting text |

## 4. Component Stylings

No prominent button or card components detected. Use the color palette and typography rules above to create components consistent with the brand.

## 5. Layout Principles

- **Base spacing unit:** `14px` — use multiples (28px, 42px, 56px, etc.)

### Spacing Scale (extracted from real elements)

| Token | Value | Role |
|---|---|---|
| spacing-1 | `14px` | element |
| spacing-2 | `32px` | card |
| spacing-3 | `8px` | element |
| spacing-4 | `6px` | element |
| spacing-5 | `1px` | element |
| spacing-6 | `18px` | element |
| spacing-7 | `24px` | card |
| spacing-8 | `144px` | section |

### Border Radius Scale

| Token | Value | Element |
|---|---|---|
| radius-card | `50px` | card |
| radius-card | `24px` | card |
| radius-button | `10px` | button |
| radius-button | `8px` | button |
| radius-button | `6px` | button |
| radius-button | `14px` | button |

## 6. Depth & Elevation

| Level | Shadow | Usage |
|---|---|---|
| Low | `rgba(0, 0, 0, 0.26) 0px 0.636954px 1.14652px -1.125px, rgba(0, 0, 0, 0.24) 0px 1...` | Cards, subtle elevation |


## 7. Do's and Don'ts

### Do
- Use `#ffffff` as the primary background color
- Use `Bricolage Grotesque` for all headings and `sans-serif` for body text
- Use `#451af5` as the single dominant accent/CTA color
- Maintain `14px` as the base spacing unit — all gaps should be multiples
- Use rounded corners (`50px`+) consistently for all interactive elements
- Apply the shadow system for elevation — use the extracted shadow values
- Use weight 600 for headings to match the brand's typographic voice

### Don't
- Don't use colors outside the extracted palette without justification
- Don't substitute Bricolage Grotesque/sans-serif with generic alternatives
- Don't use irregular spacing — stick to 14px grid
- Don't use dark/black backgrounds — this is a light-themed design
- Don't use sharp corners — they feel hostile in this rounded design language
- Don't use pure black (#000000) for text — use `#000000` instead
- Don't add decorative elements not present in the original design — no badges, ribbons, banners, or ornaments unless the source site uses them
- Don't invent UI patterns the source site doesn't have — if the original has no NEW badge, don't add one just because a red is in the palette

## 8. Responsive Behavior

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640px | Single column, stack sections, reduce font sizes ~80% |
| Tablet | 640–1024px | 2-column where appropriate, maintain spacing ratios |
| Desktop | 1024–1440px | Full layout as designed |
| Wide | > 1440px | Max-width container, center content |

- Touch targets: minimum 44×44px on mobile
- Maintain 14px base unit across breakpoints — only scale multipliers

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:  #ffffff
Text:        #000000
Accent:      #451af5
Secondary:   #06792a
Border:      #fbfaff
```

### Example Prompts

1. "Build a hero section with a `#ffffff` background, `Bricolage Grotesque` heading in `#000000`, and a `#451af5` CTA button."
2. "Create a pricing card using background `#451af5`, border `#fbfaff`, `sans-serif` for text, and 42px padding."
3. "Design a navigation bar — `#ffffff` background, `#000000` links, `#451af5` for active state."
4. "Build a feature grid with 3 columns, 42px gap, each card using the card component style."
5. "Create a footer with `#000000` background, `#ffffff` text, and 28px padding."

### Iteration Guide

1. Start with layout structure (sections, grid, spacing)
2. Apply colors from the palette — background first, then text, then accents
3. Set typography — font families, sizes from the type scale, weights
4. Add components — buttons, cards, inputs using the specs above
5. Apply border-radius consistently across all elements
6. Add shadows for depth — use the extracted shadow values, not defaults
7. Check responsive behavior — test mobile and tablet layouts
8. Final pass — verify all colors match, spacing is consistent, fonts are correct
