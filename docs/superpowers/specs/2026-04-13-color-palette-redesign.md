# Color Palette Redesign — FACL Website

**Date:** 2026-04-13
**Status:** Approved

## Problem

The existing palette (Anoka County Burnt Umber, desaturated Feldgrau teal, pale Columbia Blue) reads as muted, academic, and uninviting. The dark hero gradient (`#415C5C → #262626`) is somber. Call-to-action elements lack the visual energy needed to convert visitors into members and donors.

## Goal

Replace the current palette with one that is:
- Warm and community-rooted
- High-energy on CTAs without being harsh
- Cohesive across all sections (nav, hero, events, alt bands, news, CTA, footer)

## Approved Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#1E4020` | Nav background, primary buttons, event date chips, headings |
| `--color-primary-dark` | `#122514` | Hover states on primary, hero gradient end |
| `--color-forest` | `#2B5329` | News/blog section band background |
| `--color-gold` | `#F5BC1C` | Nav Donate button, hero CTA button |
| `--color-gold-dark` | `#E8B014` | "Join the Friends" CTA band background |
| `--color-sage` | `#C0E8A0` | Nav link text, hero subtext, footer links |
| `--color-sage-light` | `#DFF0D0` | Alt section backgrounds (replaces `--color-sky`) |
| `--color-bg` | `#FDFAF4` | Page background (keep existing warm cream) |
| `--color-dark` | `#0D1C0E` | Footer background |

### Removed tokens
- `--color-teal` (`#415C5C`) — replaced by `--color-primary`
- `--color-teal-light` (`#6F9191`) — replaced by `--color-sage`
- `--color-seaweed` (`#137C7D`) — replaced by `--color-primary`
- `--color-sky` (`#CFE1E0`) — replaced by `--color-sage-light`
- `--color-warm` (`#BC5839`) — removed, not needed in new palette
- `--color-secondary` (`#5B5248`) — replaced by body text remap

### Kept tokens
- `--color-bg` (`#FDFAF4`) — unchanged
- `--color-text` — remapped to dark green-brown for body copy
- `--color-text-muted` — remapped to muted sage-brown
- `--color-border` — keep existing neutral warm border
- `--color-focus` (`#ECE331`) — keep yellow focus ring (WCAG)

## Section-by-Section Application

### Navigation
- Background: `--color-primary` (`#1E4020`)
- Logo/text: `#F0E8D0` (warm cream)
- Nav links: `--color-sage` (`#C0E8A0`)
- Nav link hover/active: `#fff`
- Donate button: `--color-gold` (`#F5BC1C`) with dark text

### Hero
- Background: gradient `#1E4020 → #122514`
- H1: `#F5EDD6`
- Subtext: `--color-sage` (`#AECF8E`)
- Primary CTA button: `--color-gold` (`#F5BC1C`), dark text
- Secondary CTA button: cream outline

### Events Strip / Body Sections
- Background: `--color-bg` (`#FDFAF4`)
- Section headings: `--color-primary`
- Event date chip: `--color-primary` background, white text

### Alt Sections (About, Membership, etc.)
- Background: `--color-sage-light` (`#DFF0D0`)
- Headings: `--color-primary`
- Body text: `#2E4A2A`

### News/Blog Band
- Background: `--color-forest` (`#2B5329`)
- Heading: `#F0E8D0`
- Cards: white background, green card titles

### Join CTA Band
- Background: `--color-gold-dark` (`#E8B014`)
- Heading + body: dark green (`#1a2e1b`, `#2A4020`)
- Primary button: `--color-primary` background, white text
- Secondary button: `--color-primary` outline

### Footer
- Background: `--color-dark` (`#0D1C0E`)
- Section headings: `#F0E8D0`
- Links: `--color-sage` (`#C0E8A0`)
- Copyright: muted sage (`#7A9070`)

## Implementation Notes

- All token changes happen in the `:root` block in [pages/style.css](../../../pages/style.css)
- Backward-compat aliases (`--color-accent`, `--color-accent-dark`) should be updated to point to `--color-primary`
- WCAG contrast must be verified on all new combinations — especially sage text on primary green and body text on sage-light backgrounds
- The `--color-focus` yellow ring stays unchanged (already WCAG AA compliant)
- Text tokens (`--color-text`, `--color-text-muted`) need remapping to green-brown values appropriate for the new background
