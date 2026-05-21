# Stakeholder Feedback Batch — Design

**Date:** 2026-05-20
**Source:** Compiled feedback from Don + Betsy Friesen (BF) on the live site, plus follow-up clarifications (accessibility alt text, floating donate button scope, membership "Join" affordance).

## Goal

Apply the subset of stakeholder feedback that BF has approved (explicitly or conditionally), plus Don's clarifications, without touching items still pending content or stakeholder response.

## In scope

### 1. Nav: rename "Blog" → "News"
- Update every static `pages/*.html` nav + footer
- Update `navHtml()` and `footerHtml()` in `scripts/build.js`
- Update Playwright expectations in `tests/navigation.spec.js` and `tests/pages.spec.js`
- URL path stays `/blog/` for now (don't break existing post URLs / Decap config); only the label changes.

### 2. Footer: tagline under org name
- Fill the left blank space under "Friends of the Anoka County Library" with a 1–2 line tagline ("Raising funds and awareness for the Anoka County Library since 2003." or similar — use existing mission phrasing).
- Applies to every static page footer + `footerHtml()`.

### 3. Homepage: reduce space above logo
- Tighten top padding on the hero so the logo and CTA buttons pull up.
- CSS-only change in `pages/style.css` (page-specific or hero selector).

### 4. Donate page: buttons at top, copy below
- Reorder `pages/donate.html`: move the PayPal + GiveMN action block ("Donate Online" section) above "Why Your Gift Matters."
- Keep mail-by-check section where it is, near the bottom.

### 5. Membership page: "Made Membership Easier" up top + "Join" button
- Move the "We've Made Membership Easier!" `<h2>` block to be the **first** section after the page banner.
- Add a prominent "Donate to Join" button at the very top (page-banner area), linking to `/donate.html`.
- Rationale (Don's clarification): visitors expect a Join button; donations = membership.

### 6. Volunteer page: layout overhaul
- Shrink the hero image significantly.
- Move "Get Involved" section above any images.
- Convert remaining body to image-left / copy-right layout (existing pattern, not new columns).
- Add tabling photo and book-sale-volunteer photo (Don has Kate's permission for the Author Fair photo) — **placeholder file paths until files are dropped in `pages/images/`.** Mark with HTML comments so we don't ship broken images.

### 7. Bio simplification
**Rule (BF):** No photos, no elaborated paragraphs. Only `Name — Role (years)` heading + a single line stating tenure on the Board.

Apply to every `pages/board-members/*.md` file. Final shape per bio:
```markdown
---
name: Don Vo
role: Vice-President
years: 2024–present
---
Board member since 2023.
```

Don's bio specifically: `Don Vo — Vice-President (2024–present)` + body "Board member since 2023."

Update `scripts/build.js` board-member rendering to omit the `<img>` and only emit the heading + tenure line. Remove board member portraits from being rendered (the files in `pages/images/board-member-portrait/` can stay on disk but won't be referenced).

### 8. Floating "Donate" button (GiveMN one-click)
- **Additive** — does NOT replace Donate page or remove PayPal/check options.
- Fixed-position circular/pill button bottom-right on every page (skip on `/admin/*`).
- `href="https://www.givemn.org/organization/Acl"` (already in code), `target="_blank"`, `rel="noopener noreferrer"`.
- `aria-label="Donate to Friends of the Anoka County Library via GiveMN"`.
- Implement once in CSS + a small HTML snippet emitted to every static page (and `build.js` helpers). Goal: one source of truth.

### 9. Accessibility pass
Apply Don's three written alt-text strings:

- **About page hero / board group photo** — alt: "Seven white women from the Friends' Board are behind a black-clothed table smiling at the camera. Behind them a large screen gives the event title, '9th Annual Featured Local Authors Fair,' and logos of the sponsors: Clean Water Land and Legacy Amendment and Friends of the Anoka County Library."
- **Membership page big-check image** — alt: "Seven white women from the Friends' Board stand behind a large prop check dated 04/27/2026 and made out to Anoka County Library for the sum of $25,000. A couple point proudly at the total box."
- **Volunteer page hero** — alt: "Several people stand on either side of registration tables draped in black, arranging name tags for the 2025 gala: An Evening with Friends and Authors. They are dressed up for the occasion."

Additionally:
- Audit every `<img>` that is the org logo and ensure alt explicitly says "Friends of the Anoka County Library logo" (currently the nav logo uses `alt=""` because the adjacent text serves as the accessible name — that's correct; the standalone homepage logo image likely needs a real alt).
- Audit any image used as a button/link → describe the function, not the picture.

## Conditional (decide as we go)

- **Homepage white stripe behind multicolor logo + teal banner for "Supporting our…"** — only if CSS impact is small. I'll prototype and report back before committing.

## Out of scope (deferred)

- Combine Membership + Volunteer into "Get Involved" with two columns — BF didn't respond. Keep separate for now.
- Library-branch book-sale photos on Events page — BF is preparing content.
- Embedded Google Slideshow of past events — needs CSP allowlist work in `netlify.toml`. Defer until BF confirms content + variety.
- Embedded Google Doc for Sponsors — no answer from BF.
- Bottom-menu tagline beyond 1–2 lines — keep it tight; revisit if BF wants more.

## Not doing (explicitly rejected by BF)

- Replacing PayPal with GiveMN.
- Removing the check-payment option.

## Files touched

- `pages/index.html`, `pages/about.html`, `pages/donate.html`, `pages/membership.html`, `pages/volunteer.html`, `pages/events.html`, `pages/blog/index.html`
- `pages/style.css`
- `pages/board-members/*.md` (all 9 files)
- `scripts/build.js` (nav/footer helpers, board-member rendering, floating-button injection helper)
- `tests/navigation.spec.js`, `tests/pages.spec.js` (nav label "News", floating-button presence)
- `tests/accessibility.spec.js` likely picks up the alt-text changes automatically

## Verification

- `npm test` (parse-markdown unit tests still pass)
- `npm run build` succeeds and emits expected HTML
- `npm run test:e2e` — Playwright covers nav rename, page content reorderings, floating button presence
- Local preview via `npx serve pages` to eyeball homepage spacing, volunteer layout, floating button placement on mobile vs. desktop
- Manual a11y check: axe spec, plus tab through to ensure floating button is reachable + announced correctly

## Open question to confirm with Don

The bio rule wipes the existing Betsy and KeriAnn paragraphs (which contain real biographical info). Confirm BF is OK with that, since it's her own bio being cut. If unsure, I'll preserve the original `.md` content commented-out so it's recoverable, but the rendered HTML stays minimal.
