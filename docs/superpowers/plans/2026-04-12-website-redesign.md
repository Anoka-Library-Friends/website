# Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full visual and structural overhaul of the Friends of the Anoka County Library website using the official Anoka County brand palette, Montserrat/Poppins typography, a redesigned homepage, inner-page banners, a floating donate FAB, and a PayPal donate integration.

**Architecture:** All changes are to existing static HTML/CSS/JS files and the Node.js build script. No new dependencies. Design tokens live exclusively in CSS custom properties. The donate FAB is injected once by `main.js` — no per-page HTML edits needed. Tests are updated before HTML changes (TDD).

**Tech Stack:** HTML5, CSS3 custom properties, Vanilla JS (ES6), Playwright (e2e tests)

**Spec:** `docs/superpowers/specs/2026-04-12-website-redesign-design.md`

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `style.css` | Modify | Design tokens, nav/footer/hero/card styles, new components |
| `netlify.toml` | Modify | Add `form-action` to CSP for PayPal |
| `main.js` | Modify | Inject donate FAB |
| `scripts/build.js` | Modify | Update font link in generated blog post template |
| `index.html` | Modify | Font link, hero, events strip, news section, CTA band |
| `about.html` | Modify | Font link, page banner |
| `events.html` | Modify | Font link, page banner |
| `membership.html` | Modify | Font link, page banner |
| `volunteer.html` | Modify | Font link, page banner |
| `donate.html` | Modify | Font link, `data-page`, page banner, PayPal form |
| `blog/index.html` | Modify | Font link, page banner |
| `tests/pages.spec.js` | Modify | Update assertions for new structure, add FAB + events tests |

---

## Task 1: CSS — Design Tokens & Global Base

**Files:**
- Modify: `style.css` (lines 21–56 `:root` block, lines 108–120 heading colors, lines 133–135 `.section--alt`)

- [ ] **Step 1: Replace the `:root` block**

Replace the entire `:root { ... }` block (lines 21–56) with:

```css
:root {
  /* ── Brand Colors (Anoka County Color Standards) ────────────────────────── */
  --color-primary:      #904026;  /* AC Burnt Umber — buttons, headings, accents */
  --color-primary-dark: #6A3222;  /* Liver — hover states on primary */
  --color-secondary:    #5B5248;  /* Umber — body text, secondary elements */
  --color-warm:         #BC5839;  /* Crayola Brown — warm accents */
  --color-teal:         #415C5C;  /* Feldgrau — nav, card section bands */
  --color-teal-light:   #6F9191;  /* Desaturated Cyan — teal hover states */
  --color-seaweed:      #137C7D;  /* Metallic Seaweed — links, icon accents */
  --color-sky:          #CFE1E0;  /* Columbia Blue — alt section bg, placeholders */
  --color-bg:           #F8F5EC;  /* Isabelline — page background */
  --color-dark:         #262626;  /* Raisin Black — header, footer */
  --color-text:         #422E1D;  /* Deep brown — body text */
  --color-text-muted:   #A29586;  /* Grullo — muted/secondary text */
  --color-border:       #ddd8d0;  /* Neutral warm border */
  --color-focus:        #ECE331;  /* Yellow — high-contrast focus ring (WCAG AA) */

  /* ── Typography (update @import in HTML if font names change) ────────────── */
  --font-heading: 'Montserrat', Arial, sans-serif;
  --font-body:    'Poppins', Arial, Helvetica, sans-serif;
  --font-serif:   'Merriweather', Georgia, serif;  /* pull quotes, editorial */

  /* ── Scale & Spacing (unchanged) ─────────────────────────────────────────── */
  --font-size-sm:  0.875rem;
  --font-size-md:  1rem;
  --font-size-lg:  1.25rem;
  --font-size-xl:  1.75rem;
  --font-size-2xl: 2.5rem;
  --line-height:   1.65;

  --space-xs:  0.25rem;
  --space-sm:  0.5rem;
  --space-md:  1rem;
  --space-lg:  2rem;
  --space-xl:  4rem;

  --max-width:  1100px;
  --nav-height: 64px;
  --radius:     4px;
  --radius-lg:  8px;
}
```

- [ ] **Step 2: Update heading default color**

Find (lines ~108–112):
```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  line-height: 1.2;
  color: var(--color-primary-dark);
}
```
Replace with:
```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-primary-dark);
}
```

- [ ] **Step 3: Update `.section--alt` to use `--color-sky`**

Find:
```css
.section--alt {
  background: var(--color-bg-alt);
}
```
Replace with:
```css
.section--alt {
  background: var(--color-sky);
}
```

- [ ] **Step 4: Update default link color**

Find:
```css
a {
  color: var(--color-primary);
}

a:hover {
  color: var(--color-primary-dark);
}
```
Replace with:
```css
a {
  color: var(--color-seaweed);
}

a:hover {
  color: var(--color-teal);
}
```

- [ ] **Step 5: Run existing tests to confirm nothing is broken**

```bash
npx playwright test --reporter=line
```
Expected: all tests pass (CSS-only change, no structure changed).

- [ ] **Step 6: Commit**

```bash
git add style.css
git commit -m "style: replace design tokens with official Anoka County brand palette"
```

---

## Task 2: CSS — Nav & Footer

**Files:**
- Modify: `style.css` (nav section ~lines 226–356, footer section ~lines 361–421)

- [ ] **Step 1: Update nav header background and border**

Find:
```css
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  height: var(--nav-height);
  display: flex;
  align-items: center;
}
```
Replace with:
```css
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-dark);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  height: var(--nav-height);
  display: flex;
  align-items: center;
}
```

- [ ] **Step 2: Update nav link colors**

Find:
```css
.nav-links a {
  font-weight: 600;
  text-decoration: none;
  color: var(--color-text);
  padding: 0.625rem var(--space-sm);  /* 10px vertical → ~46px tap target (WCAG 2.5.5) */
  border-radius: var(--radius);
}

.nav-links a:hover {
  color: var(--color-primary);
}

.nav-links a[aria-current="page"] {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 4px;
}
```
Replace with:
```css
.nav-links a {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: var(--font-size-sm);
  text-decoration: none;
  color: var(--color-text-muted);
  padding: 0.625rem var(--space-sm);  /* 10px vertical → ~46px tap target (WCAG 2.5.5) */
  border-radius: var(--radius);
  transition: color 0.15s;
}

.nav-links a:hover {
  color: #fff;
}

.nav-links a[aria-current="page"] {
  color: #fff;
  text-decoration: underline;
  text-underline-offset: 4px;
}
```

- [ ] **Step 3: Update donate nav button**

Find:
```css
/* Donate link styled as button */
.nav-links .nav-donate {
  background: var(--color-accent);
  color: #fff;
  padding: 0.4rem 1rem;
  border-radius: var(--radius);
}

.nav-links .nav-donate:hover {
  background: var(--color-accent-dark);
  color: #fff;
}

/* Keep donate link text white when active (overrides the aria-current color rule) */
.nav-links .nav-donate[aria-current="page"] {
  color: #fff;
}
```
Replace with:
```css
/* Donate link styled as button */
.nav-links .nav-donate {
  background: var(--color-primary);
  color: #fff;
  padding: 0.4rem 1rem;
  border-radius: var(--radius);
}

.nav-links .nav-donate:hover {
  background: var(--color-primary-dark);
  color: #fff;
}

.nav-links .nav-donate[aria-current="page"] {
  color: #fff;
}
```

- [ ] **Step 4: Update hamburger bar color for dark nav**

Find:
```css
.hamburger-bar {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--color-text);
  border-radius: 2px;
  transition: transform 0.2s, opacity 0.2s;
}
```
Replace with:
```css
.hamburger-bar {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--color-text-muted);
  border-radius: 2px;
  transition: transform 0.2s, opacity 0.2s;
}
```

- [ ] **Step 5: Update mobile nav dropdown background**

Find:
```css
  .nav-links {
    display: none;
    position: absolute;
    top: var(--nav-height);
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
    background: var(--color-bg);
    border-bottom: 1px solid var(--color-border);
    padding: var(--space-md) var(--space-lg);
  }
```
Replace with:
```css
  .nav-links {
    display: none;
    position: absolute;
    top: var(--nav-height);
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
    background: var(--color-dark);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: var(--space-md) var(--space-lg);
  }
```

- [ ] **Step 6: Update mobile nav link border**

Find:
```css
  .nav-links a {
    width: 100%;
    padding: var(--space-sm) 0;
    border-bottom: 1px solid var(--color-border);
  }
```
Replace with:
```css
  .nav-links a {
    width: 100%;
    padding: var(--space-sm) 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
```

- [ ] **Step 7: Update footer background**

Find:
```css
.site-footer {
  background: var(--color-primary-dark);
  color: rgba(255, 255, 255, 0.85);
  padding-block: var(--space-xl);
}
```
Replace with:
```css
.site-footer {
  background: var(--color-dark);
  color: var(--color-text-muted);
  padding-block: var(--space-xl);
}
```

- [ ] **Step 8: Update footer link colors**

Find:
```css
.site-footer a {
  color: rgba(255, 255, 255, 0.85);
}

.site-footer a:hover {
  color: #fff;
}
```
Replace with:
```css
.site-footer a {
  color: var(--color-text-muted);
}

.site-footer a:hover {
  color: var(--color-sky);
}
```

- [ ] **Step 9: Run tests**

```bash
npx playwright test --reporter=line
```
Expected: all tests pass.

- [ ] **Step 10: Commit**

```bash
git add style.css
git commit -m "style: update nav and footer to dark brand colors"
```

---

## Task 3: CSS — Hero, Buttons, Cards, Donate

**Files:**
- Modify: `style.css` (hero, buttons, cards, donate sections)

- [ ] **Step 1: Update hero section**

Find the entire hero block:
```css
/* =============================================
   HERO SECTION
   ============================================= */
.hero {
  background: var(--color-primary);
  color: #fff;
  padding-block: var(--space-xl);
  text-align: center;
}

.hero h1 {
  color: #fff;
  margin-bottom: var(--space-md);
}

.hero p {
  font-size: var(--font-size-lg);
  max-width: 640px;
  margin-inline: auto;
  margin-bottom: var(--space-lg);
  opacity: 0.9;
}
```
Replace with:
```css
/* =============================================
   HERO SECTION
   ============================================= */
.hero {
  background: linear-gradient(135deg, var(--color-teal) 0%, var(--color-dark) 100%);
  color: #fff;
  padding-block: 6rem;
  text-align: center;
}

.hero__eyebrow {
  font-family: var(--font-heading);
  font-size: var(--font-size-sm);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-sky);
  margin-bottom: var(--space-md);
}

.hero h1 {
  font-family: var(--font-heading);
  font-weight: 800;
  color: var(--color-bg);
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.15;
  margin-bottom: var(--space-md);
}

.hero > .container > p {
  color: var(--color-sky);
  font-size: var(--font-size-lg);
  max-width: 640px;
  margin-inline: auto;
  margin-bottom: var(--space-lg);
}

.hero__actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
}
```

- [ ] **Step 2: Update button base and variants**

Find the `.btn--donate` block:
```css
.btn--donate {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
}

.btn--donate:hover,
.btn--donate:focus-visible {
  background: var(--color-accent-dark);
  border-color: var(--color-accent-dark);
  color: #fff;
}
```
Replace with (repurposes `.btn--donate` to use primary):
```css
.btn--donate {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.btn--donate:hover,
.btn--donate:focus-visible {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  color: #fff;
}
```

Then add these new button variants immediately after the `.btn--outline` block:
```css
/* Hero outline — cream border/text for use on dark backgrounds */
.btn--hero-outline {
  background: transparent;
  color: var(--color-bg);
  border: 2px solid var(--color-bg);
}

.btn--hero-outline:hover,
.btn--hero-outline:focus-visible {
  background: var(--color-bg);
  color: var(--color-primary);
}

/* Cream — for use on primary-colored backgrounds */
.btn--cream {
  background: var(--color-bg);
  color: var(--color-primary);
  border-color: var(--color-bg);
  font-family: var(--font-heading);
  font-weight: 700;
}

.btn--cream:hover,
.btn--cream:focus-visible {
  background: white;
  border-color: white;
  color: var(--color-primary);
}
```

- [ ] **Step 3: Update card styles**

Find:
```css
.card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  background: var(--color-bg);
}

.card__date {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-xs);
}

.card__title {
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-sm);
}

.card__excerpt {
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}
```
Replace with:
```css
.card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  background: white;
}

.card__date {
  font-family: var(--font-heading);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: var(--space-xs);
}

.card__title {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  margin-bottom: var(--space-sm);
}

.card__title a {
  color: var(--color-primary);
  text-decoration: none;
}

.card__title a:hover {
  color: var(--color-primary-dark);
}

.card__excerpt {
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}
```

- [ ] **Step 4: Replace the donate page styles**

Find the entire donate page block:
```css
/* =============================================
   DONATE PAGE
   ============================================= */
.donate-hero {
  background: var(--color-accent);
  color: #fff;
  text-align: center;
  padding-block: var(--space-xl);
}

.donate-hero h1 {
  color: #fff;
}

.donate-cta {
  text-align: center;
  padding-block: var(--space-xl);
}

.donate-cta .btn {
  font-size: var(--font-size-lg);
  padding: 1rem 2.5rem;
}
```
Replace with:
```css
/* =============================================
   DONATE PAGE
   ============================================= */
.donate-section {
  text-align: center;
  padding-block: var(--space-xl);
}

.btn--paypal {
  background: var(--color-primary);
  color: #fff;
  border: 2px solid var(--color-primary);
  border-radius: var(--radius);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--font-size-lg);
  padding: 1rem 2.5rem;
  cursor: pointer;
  display: inline-block;
  transition: background 0.15s, border-color 0.15s;
}

.btn--paypal:hover,
.btn--paypal:focus-visible {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  color: #fff;
}
```

- [ ] **Step 5: Run tests**

```bash
npx playwright test --reporter=line
```
Expected: all tests pass (donate test still finds `.donate-hero` — that's OK, it exists in HTML still at this point).

- [ ] **Step 6: Commit**

```bash
git add style.css
git commit -m "style: update hero gradient, buttons, cards, and donate page styles"
```

---

## Task 4: CSS — New Components

**Files:**
- Modify: `style.css` (append new sections before the `@media (prefers-reduced-motion)` block)

- [ ] **Step 1: Add page banner, events strip, teal news section, CTA band, and donate FAB styles**

Find the reduced-motion block at the end of the file:
```css
/* =============================================
   REDUCED MOTION
   ============================================= */
```
Insert this entire block immediately before it:

```css
/* =============================================
   PAGE BANNER (inner pages)
   ============================================= */
.page-banner {
  background: var(--color-dark);
  padding-block: 3rem;
  text-align: center;
}

.page-banner h1 {
  font-family: var(--font-heading);
  font-weight: 800;
  color: var(--color-bg);
  font-size: 2.2rem;
  line-height: 1.15;
  margin-bottom: var(--space-sm);
}

.page-banner__subtitle {
  color: var(--color-text-muted);
  font-size: var(--font-size-md);
  margin: 0;
}

/* =============================================
   EVENTS STRIP (homepage)
   ============================================= */
.events-strip {
  background: var(--color-bg);
}

.events-strip h2 {
  font-family: var(--font-heading);
  font-weight: 800;
  color: var(--color-primary);
  margin-bottom: var(--space-lg);
}

.event-list {
  list-style: none;
}

.event-item {
  display: flex;
  gap: var(--space-lg);
  align-items: flex-start;
  padding-block: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.event-item:first-child {
  border-top: 1px solid var(--color-border);
}

.event-date {
  flex-shrink: 0;
  background: var(--color-primary);
  color: white;
  text-align: center;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius);
  min-width: 52px;
  font-family: var(--font-heading);
}

.event-date__month {
  display: block;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.85;
}

.event-date__day {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
}

.event-title {
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--color-text);
  font-size: var(--font-size-md);
  margin-bottom: var(--space-xs);
}

.event-desc {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin: 0;
}

.events-strip__link {
  display: inline-block;
  margin-top: var(--space-md);
  color: var(--color-seaweed);
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: var(--font-size-sm);
  text-decoration: none;
}

.events-strip__link:hover {
  color: var(--color-teal);
}

/* =============================================
   TEAL NEWS SECTION (homepage latest news)
   ============================================= */
.section--teal {
  background: var(--color-teal);
}

.section--teal h2 {
  color: var(--color-bg);
}

.section--teal .card {
  background: white;
}

/* =============================================
   CTA BAND (homepage join section)
   ============================================= */
.cta-band {
  background: var(--color-primary);
  text-align: center;
  padding-block: var(--space-xl);
}

.cta-band h2 {
  color: white;
  font-family: var(--font-heading);
  font-weight: 800;
  margin-bottom: var(--space-md);
}

.cta-band p {
  color: var(--color-sky);
  margin-bottom: var(--space-lg);
  max-width: 560px;
  margin-inline: auto;
}

.cta-band__actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
}

/* =============================================
   FLOATING DONATE BUTTON
   ============================================= */
.donate-fab {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background: var(--color-primary);
  color: #fff;
  text-decoration: none;
  padding: 0 1.5rem;
  height: 56px;           /* WCAG 2.5.5: minimum 44px tap target */
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--font-size-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  z-index: 1000;
  transition: background 0.15s, transform 0.15s;
  letter-spacing: 0.02em;
}

.donate-fab:hover,
.donate-fab:focus-visible {
  background: var(--color-primary-dark);
  color: #fff;
  transform: scale(1.05);
}

```

- [ ] **Step 2: Run tests**

```bash
npx playwright test --reporter=line
```
Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "style: add page-banner, events-strip, cta-band, donate-fab components"
```

---

## Task 5: netlify.toml — CSP Update for PayPal

**Files:**
- Modify: `netlify.toml`

- [ ] **Step 1: Add `form-action` directive to the public pages CSP**

The PayPal donate form posts to `https://www.paypal.com/donate`. Without `form-action` in the CSP, the browser blocks the form submission.

Find:
```toml
    Content-Security-Policy = "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; frame-src https://calendar.google.com; img-src 'self' data:; script-src 'self' https://identity.netlify.com"
```
Replace with:
```toml
    Content-Security-Policy = "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; frame-src https://calendar.google.com; img-src 'self' data:; script-src 'self' https://identity.netlify.com; form-action 'self' https://www.paypal.com"
```

- [ ] **Step 2: Commit**

```bash
git add netlify.toml
git commit -m "security: add PayPal form-action to CSP for donate page"
```

---

## Task 6: scripts/build.js — Update Font Link in Blog Post Template

**Files:**
- Modify: `scripts/build.js` (line 126)

The `generateBlogPostPage()` function hardcodes the Google Font URL. It must be updated so generated blog post HTML files load Montserrat/Poppins/Merriweather instead of Open Sans.

- [ ] **Step 1: Replace the font link in `generateBlogPostPage`**

Find (line ~126):
```js
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
```
Replace with:
```js
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Poppins:wght@400;500;600&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Run the build to regenerate blog post files**

```bash
npm run build
```
Expected output includes lines like:
```
[build] → /path/to/blog/welcome-to-our-new-website.html
[build] → /path/to/blog/annual-book-sale-2026.html
[build] → /path/to/blog/summer-reading-program-recap.html
[build] Done.
```

- [ ] **Step 3: Commit**

```bash
git add scripts/build.js blog/
git commit -m "build: update font link in generated blog post template to Montserrat/Poppins"
```

---

## Task 7: main.js — Inject Donate FAB

**Files:**
- Modify: `main.js`

The FAB is injected once by JS so it appears on all pages without touching each HTML file. It is suppressed on `donate.html` via `data-page="donate"` on `<body>`.

- [ ] **Step 1: Add donate FAB injection at the end of the IIFE in `main.js`**

Find the end of the IIFE (just before the closing `}());`):
```js
  // ── Footer year ───────────────────────────────────────────────────────────────
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}());
```
Replace with:
```js
  // ── Footer year ───────────────────────────────────────────────────────────────
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ── Floating Donate Button ────────────────────────────────────────────────────
  // Suppressed on donate.html via data-page="donate" on <body>.
  if (document.body.dataset.page !== 'donate') {
    const fab = document.createElement('a');
    fab.href = '/donate.html';
    fab.className = 'donate-fab';
    fab.setAttribute('aria-label', 'Donate to Friends of the Anoka County Library');
    fab.textContent = '♥ Donate';
    document.body.appendChild(fab);
  }
}());
```

- [ ] **Step 2: Commit**

```bash
git add main.js
git commit -m "feat: inject floating donate FAB via main.js on all pages except donate"
```

---

## Task 8: Update Playwright Tests

**Files:**
- Modify: `tests/pages.spec.js`

Update assertions that will break due to structural changes, and add assertions for new features. Run to confirm they fail before implementing HTML changes.

- [ ] **Step 1: Update the homepage test**

Find:
```js
test('home page: title, h1, hero, recent posts, CTAs', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Friends of the Anoka County Library/);
  await expect(page.locator('h1')).toHaveText('Supporting Our Library, Strengthening Our Community');
  await checkSharedElements(page);

  // Hero CTA links to membership
  await expect(page.locator('.hero a.btn')).toHaveAttribute('href', '/membership.html');

  // Recent posts section injected by build script — should contain article cards
  const recentSection = page.locator('section').filter({ hasText: 'Latest News' });
  await expect(recentSection.locator('article')).toHaveCount(3);

  // Join CTA section — two buttons
  const ctaSection = page.locator('section').filter({ hasText: 'Join the Friends Today' });
  await expect(ctaSection.locator('a.btn')).toHaveCount(2);
});
```
Replace with:
```js
test('home page: title, h1, hero, events strip, recent posts, CTAs', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Friends of the Anoka County Library/);
  await expect(page.locator('h1')).toHaveText('Supporting Our Library, Strengthening Our Community');
  await checkSharedElements(page);

  // Hero has two buttons: member + donate
  await expect(page.locator('.hero a.btn').first()).toHaveAttribute('href', '/membership.html');
  await expect(page.locator('.hero a.btn').nth(1)).toHaveAttribute('href', '/donate.html');

  // Upcoming Events strip with at least one event item
  const eventsSection = page.locator('.events-strip');
  await expect(eventsSection).toBeVisible();
  await expect(eventsSection.locator('.event-item')).toHaveCount(3);
  await expect(eventsSection.locator('.events-strip__link')).toHaveAttribute('href', '/events.html');

  // Recent posts section — three blog cards
  const recentSection = page.locator('.section--teal');
  await expect(recentSection.locator('article')).toHaveCount(3);

  // CTA band — two cream buttons
  const ctaBand = page.locator('.cta-band');
  await expect(ctaBand).toBeVisible();
  await expect(ctaBand.locator('a.btn')).toHaveCount(2);

  // Donate FAB present on homepage
  await expect(page.locator('.donate-fab')).toBeVisible();
  await expect(page.locator('.donate-fab')).toHaveAttribute('href', '/donate.html');
});
```

- [ ] **Step 2: Update the about page test**

Find:
```js
test('about page: title, h1, sections, contact anchor', async ({ page }) => {
  await page.goto('/about.html');
  await expect(page).toHaveTitle(/About & Contact/);
  await expect(page.locator('h1')).toHaveText('About Us');
  await checkSharedElements(page);

  // All four required sections present
  await expect(page.locator('h2', { hasText: 'Our History' })).toBeVisible();
  await expect(page.locator('h2', { hasText: 'Board Members' })).toBeVisible();
  await expect(page.locator('h2', { hasText: 'Partners' })).toBeVisible();
  await expect(page.locator('h2', { hasText: 'Contact Us' })).toBeVisible();

  // #contact anchor exists for deep-linking
  await expect(page.locator('#contact')).toBeAttached();
});
```
Replace with:
```js
test('about page: title, h1, page banner, sections, contact anchor', async ({ page }) => {
  await page.goto('/about.html');
  await expect(page).toHaveTitle(/About & Contact/);
  await expect(page.locator('h1')).toHaveText('About & Contact');
  await expect(page.locator('.page-banner')).toBeVisible();
  await checkSharedElements(page);

  // All four required sections present (now h2 since h1 is in the banner)
  await expect(page.locator('h2', { hasText: 'Our History' })).toBeVisible();
  await expect(page.locator('h2', { hasText: 'Board Members' })).toBeVisible();
  await expect(page.locator('h2', { hasText: 'Partners' })).toBeVisible();
  await expect(page.locator('h2', { hasText: 'Contact Us' })).toBeVisible();

  // #contact anchor exists for deep-linking
  await expect(page.locator('#contact')).toBeAttached();

  // Donate FAB present
  await expect(page.locator('.donate-fab')).toBeVisible();
});
```

- [ ] **Step 3: Update the events page test**

Find:
```js
test('events page: title, h1, calendar iframe with title and loading attrs', async ({ page }) => {
  await page.goto('/events.html');
  await expect(page).toHaveTitle(/Events/);
  await expect(page.locator('h1')).toHaveText('Events');
  await checkSharedElements(page);
  ...
```
Replace the first three assertions with:
```js
test('events page: title, h1, page banner, calendar iframe with title and loading attrs', async ({ page }) => {
  await page.goto('/events.html');
  await expect(page).toHaveTitle(/Events/);
  await expect(page.locator('h1')).toHaveText('Events & Programs');
  await expect(page.locator('.page-banner')).toBeVisible();
  await checkSharedElements(page);
  ...
```
(Keep the rest of the test unchanged.)

- [ ] **Step 4: Update the membership page test**

Find:
```js
test('membership page: title, h1, three tier cards, featured tier, mailto links', async ({ page }) => {
  await page.goto('/membership.html');
  await expect(page).toHaveTitle(/Membership/);
  await expect(page.locator('h1')).toHaveText('Membership');
  await checkSharedElements(page);
```
Replace the first assertion block with:
```js
test('membership page: title, h1, page banner, three tier cards, featured tier, mailto links', async ({ page }) => {
  await page.goto('/membership.html');
  await expect(page).toHaveTitle(/Membership/);
  await expect(page.locator('h1')).toHaveText('Membership');
  await expect(page.locator('.page-banner')).toBeVisible();
  await checkSharedElements(page);
```
(Keep the rest of the test unchanged.)

- [ ] **Step 5: Update the volunteer page test**

Find:
```js
test('volunteer page: title, h1, injected opportunity card, sign-up button', async ({ page }) => {
  await page.goto('/volunteer.html');
  await expect(page).toHaveTitle(/Volunteer/);
  await expect(page.locator('h1')).toHaveText('Volunteer Opportunities');
  await checkSharedElements(page);
```
Replace with:
```js
test('volunteer page: title, h1, page banner, injected opportunity card, sign-up button', async ({ page }) => {
  await page.goto('/volunteer.html');
  await expect(page).toHaveTitle(/Volunteer/);
  await expect(page.locator('h1')).toHaveText('Volunteer');
  await expect(page.locator('.page-banner')).toBeVisible();
  await checkSharedElements(page);
```
(Keep the rest of the test unchanged.)

- [ ] **Step 6: Update the blog index test**

Find:
```js
test('blog index: title, h1, injected post list with three sample posts', async ({ page }) => {
  await page.goto('/blog/');
  await expect(page).toHaveTitle(/Blog/);
  await expect(page.locator('h1')).toHaveText('Blog');
  await checkSharedElements(page);
```
Replace with:
```js
test('blog index: title, h1, page banner, injected post list with three sample posts', async ({ page }) => {
  await page.goto('/blog/');
  await expect(page).toHaveTitle(/Blog/);
  await expect(page.locator('h1')).toHaveText('Latest News');
  await expect(page.locator('.page-banner')).toBeVisible();
  await checkSharedElements(page);
```
(Keep the rest of the test unchanged.)

- [ ] **Step 7: Replace the donate page test**

Find and replace the entire donate page test:
```js
test('donate page: title, h1, donate button opens new tab with noopener', async ({ page }) => {
  await page.goto('/donate.html');
  await expect(page).toHaveTitle(/Donate/);
  await expect(page.locator('h1')).toHaveText('Make a Difference');
  await checkSharedElements(page);

  // Donate hero section
  await expect(page.locator('.donate-hero')).toBeVisible();

  // "Why Your Gift Matters" section
  await expect(page.locator('h2', { hasText: 'Why Your Gift Matters' })).toBeVisible();

  // Donate CTA button — must open new tab safely
  const donateBtn = page.locator('.donate-cta .btn');
  await expect(donateBtn).toBeVisible();
  await expect(donateBtn).toHaveAttribute('target', '_blank');
  await expect(donateBtn).toHaveAttribute('rel', /noopener/);
  await expect(donateBtn).toHaveAttribute('aria-label', /new tab/i);

  // Disclaimer text
  await expect(page.locator('.donate-cta p')).toBeVisible();
});
```
Replace with:
```js
test('donate page: title, page banner, impact statement, PayPal form, no FAB', async ({ page }) => {
  await page.goto('/donate.html');
  await expect(page).toHaveTitle(/Donate/);
  await expect(page.locator('h1')).toHaveText('Make a Donation');
  await expect(page.locator('.page-banner')).toBeVisible();
  await checkSharedElements(page);

  // Impact statement heading
  await expect(page.locator('h2', { hasText: 'Why Your Gift Matters' })).toBeVisible();

  // PayPal form
  const form = page.locator('form[action="https://www.paypal.com/donate"]');
  await expect(form).toBeAttached();
  await expect(form.locator('input[name="hosted_button_id"]')).toBeAttached();
  await expect(form.locator('button[type="submit"]')).toBeVisible();

  // Security note below button
  await expect(page.locator('.donate-section p')).toBeVisible();

  // Donate FAB must NOT appear on donate page
  await expect(page.locator('.donate-fab')).not.toBeAttached();
});
```

- [ ] **Step 8: Run tests — confirm they fail as expected**

```bash
npx playwright test --reporter=line
```
Expected: multiple failures for assertions about `.page-banner`, new hero buttons, events strip, PayPal form, etc. This is correct — they should fail because HTML hasn't changed yet.

- [ ] **Step 9: Commit updated tests**

```bash
git add tests/pages.spec.js
git commit -m "test: update Playwright assertions for redesigned homepage, inner pages, and donate PayPal form"
```

---

## Task 9: index.html — Homepage Redesign

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the Google Font link**

Find:
```html
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
```
Replace with:
```html
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Poppins:wght@400;500;600&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Replace the hero section**

Find:
```html
    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <h1>Supporting Our Library, Strengthening Our Community</h1>
        <p><!-- CONTENT: mission statement — supplied by organization --></p>
        <a href="/membership.html" class="btn btn--primary">Become a Member</a>
      </div>
    </section>
```
Replace with:
```html
    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <p class="hero__eyebrow">Friends of the Anoka County Library</p>
        <h1>Supporting Our Library,<br>Strengthening Our Community</h1>
        <p><!-- CONTENT: mission statement — supplied by organization --></p>
        <div class="hero__actions">
          <a href="/membership.html" class="btn btn--primary">Become a Member</a>
          <a href="/donate.html" class="btn btn--hero-outline">Make a Donation</a>
        </div>
      </div>
    </section>
```

- [ ] **Step 3: Replace the "Featured Events" placeholder section with the Events Strip**

Find:
```html
    <!-- Featured Events (placeholder — update after content delivered) -->
    <section class="section">
      <div class="container">
        <h2>Upcoming Events</h2>
        <p>Check our <a href="/events.html">events calendar</a> for upcoming programs, book sales, and community gatherings.</p>
      </div>
    </section>
```
Replace with:
```html
    <!-- Upcoming Events Strip -->
    <!-- EVENTS: Replace placeholder events with real dates and details when available. -->
    <section class="section events-strip">
      <div class="container">
        <h2>Upcoming Events</h2>
        <ul class="event-list" role="list">
          <li class="event-item">
            <div class="event-date" aria-hidden="true">
              <span class="event-date__month">APR</span>
              <span class="event-date__day">25</span>
            </div>
            <div class="event-details">
              <h3 class="event-title">Annual Book Sale</h3>
              <p class="event-desc">Join us for three days of discounted books, DVDs, and more at the Anoka County Library.</p>
            </div>
          </li>
          <li class="event-item">
            <div class="event-date" aria-hidden="true">
              <span class="event-date__month">MAY</span>
              <span class="event-date__day">10</span>
            </div>
            <div class="event-details">
              <h3 class="event-title">Friends Board Meeting</h3>
              <p class="event-desc">Open to the public. Come learn about our upcoming programs and how you can get involved.</p>
            </div>
          </li>
          <li class="event-item">
            <div class="event-date" aria-hidden="true">
              <span class="event-date__month">JUN</span>
              <span class="event-date__day">1</span>
            </div>
            <div class="event-details">
              <h3 class="event-title">Summer Reading Kickoff</h3>
              <p class="event-desc">Celebrate the launch of the summer reading program with activities for kids of all ages.</p>
            </div>
          </li>
        </ul>
        <a href="/events.html" class="events-strip__link">See all events →</a>
      </div>
    </section>
```

- [ ] **Step 4: Update the Recent Blog Posts section to use teal styling**

Find:
```html
    <!-- Recent Blog Posts — injected by build script -->
    <section class="section section--alt">
      <div class="container">
        <h2>Latest News</h2>
```
Replace with:
```html
    <!-- Recent Blog Posts — injected by build script -->
    <section class="section section--teal">
      <div class="container">
        <h2>Latest News</h2>
```

Find (within that same section):
```html
        <p style="margin-top: 1.5rem;"><a href="/blog/" class="btn btn--outline">All Posts</a></p>
```
Replace with:
```html
        <p style="margin-top: 1.5rem;"><a href="/blog/" class="btn btn--hero-outline">All Posts</a></p>
```

- [ ] **Step 5: Replace the CTA section with the CTA band**

Find:
```html
    <!-- CTA -->
    <section class="section">
      <div class="container" style="text-align: center;">
        <h2>Join the Friends Today</h2>
        <p>Your membership directly funds library programs, equipment, and events for our entire community.</p>
        <a href="/membership.html" class="btn btn--primary" style="margin-right: 1rem;">View Membership Tiers</a>
        <a href="/donate.html" class="btn btn--donate">Make a Donation</a>
      </div>
    </section>
```
Replace with:
```html
    <!-- CTA Band -->
    <section class="cta-band">
      <div class="container">
        <h2>Join the Friends Today</h2>
        <p>Your membership directly funds library programs, equipment, and events for our entire community.</p>
        <div class="cta-band__actions">
          <a href="/membership.html" class="btn btn--cream">View Membership Tiers</a>
          <a href="/donate.html" class="btn btn--cream">Make a Donation</a>
        </div>
      </div>
    </section>
```

- [ ] **Step 6: Run tests — homepage tests should pass**

```bash
npx playwright test tests/pages.spec.js --reporter=line
```
Expected: homepage test passes. Inner page and donate tests still fail (not yet implemented).

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat: redesign homepage with events strip, teal news section, and CTA band"
```

---

## Task 10: about.html — Font & Page Banner

**Files:**
- Modify: `about.html`

- [ ] **Step 1: Replace font link**

Find:
```html
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
```
Replace with:
```html
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Poppins:wght@400;500;600&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Add page banner and remove old h1**

Find:
```html
  <main id="main-content">

    <section class="section">
      <div class="container">
        <h1>About Us</h1>

        <h2>Our History</h2>
```
Replace with:
```html
  <main id="main-content">

    <section class="page-banner">
      <div class="container">
        <h1>About &amp; Contact</h1>
        <p class="page-banner__subtitle">Learn about our mission, board, and how to reach us</p>
      </div>
    </section>

    <section class="section">
      <div class="container">

        <h2>Our History</h2>
```

- [ ] **Step 3: Run tests**

```bash
npx playwright test tests/pages.spec.js --reporter=line
```
Expected: about page test now passes.

- [ ] **Step 4: Commit**

```bash
git add about.html
git commit -m "feat: add page banner to about.html with brand font"
```

---

## Task 11: events.html — Font & Page Banner

**Files:**
- Modify: `events.html`

- [ ] **Step 1: Replace font link** (same replacement as Task 10 Step 1)

Find:
```html
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
```
Replace with:
```html
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Poppins:wght@400;500;600&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Add page banner and remove old h1**

Find:
```html
  <main id="main-content">
    <section class="section">
      <div class="container">
        <h1>Events</h1>
        <p>All events are managed through our Google Calendar.
```
Replace with:
```html
  <main id="main-content">

    <section class="page-banner">
      <div class="container">
        <h1>Events &amp; Programs</h1>
        <p class="page-banner__subtitle">Upcoming programs, book sales, and community gatherings</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <p>All events are managed through our Google Calendar.
```

- [ ] **Step 3: Run tests**

```bash
npx playwright test tests/pages.spec.js --reporter=line
```
Expected: events page test now passes.

- [ ] **Step 4: Commit**

```bash
git add events.html
git commit -m "feat: add page banner to events.html"
```

---

## Task 12: membership.html — Font & Page Banner

**Files:**
- Modify: `membership.html`

- [ ] **Step 1: Replace font link**

Find:
```html
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
```
Replace with:
```html
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Poppins:wght@400;500;600&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Add page banner before the first section**

Find:
```html
  <main id="main-content">

    <section class="section">
      <div class="container">
        <h1>Membership</h1>
```
Replace with:
```html
  <main id="main-content">

    <section class="page-banner">
      <div class="container">
        <h1>Membership</h1>
        <p class="page-banner__subtitle">Support the library — join the Friends today</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
```

- [ ] **Step 3: Run tests**

```bash
npx playwright test tests/pages.spec.js --reporter=line
```
Expected: membership page test passes.

- [ ] **Step 4: Commit**

```bash
git add membership.html
git commit -m "feat: add page banner to membership.html"
```

---

## Task 13: volunteer.html — Font & Page Banner

**Files:**
- Modify: `volunteer.html`

- [ ] **Step 1: Replace font link**

Find:
```html
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
```
Replace with:
```html
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Poppins:wght@400;500;600&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Add page banner**

The volunteer page h1 is injected by the build script into the content area as "Volunteer Opportunities" (inside a volunteer-card h2, not the page h1). The page's `<h1>` is in the static markup. Find it:

```html
  <main id="main-content">
```
Add the banner immediately after:
```html
  <main id="main-content">

    <section class="page-banner">
      <div class="container">
        <h1>Volunteer</h1>
        <p class="page-banner__subtitle">Make a difference in your community</p>
      </div>
    </section>
```

Then find and remove the existing standalone h1 if present in the volunteer content. Look for any `<h1>` inside `<main>` that is not in `.page-banner` and remove it. (The volunteer page may not have a standalone h1 — the build-injected content uses h2. If none found, skip.)

- [ ] **Step 3: Run tests**

```bash
npx playwright test tests/pages.spec.js --reporter=line
```
Expected: volunteer page test passes.

- [ ] **Step 4: Commit**

```bash
git add volunteer.html
git commit -m "feat: add page banner to volunteer.html"
```

---

## Task 14: blog/index.html — Font & Page Banner

**Files:**
- Modify: `blog/index.html`

- [ ] **Step 1: Replace font link**

Find:
```html
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
```
Replace with:
```html
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Poppins:wght@400;500;600&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Add page banner and remove existing h1**

Find:
```html
  <main id="main-content">
    <section class="section">
```
Replace with:
```html
  <main id="main-content">

    <section class="page-banner">
      <div class="container">
        <h1>Latest News</h1>
        <p class="page-banner__subtitle">Updates, stories, and announcements from the Friends</p>
      </div>
    </section>

    <section class="section">
```

Then find and remove the old `<h1>Blog</h1>` line from within the `<section class="section">` if it exists.

- [ ] **Step 3: Run tests**

```bash
npx playwright test tests/pages.spec.js --reporter=line
```
Expected: blog index test passes.

- [ ] **Step 4: Commit**

```bash
git add blog/index.html
git commit -m "feat: add page banner to blog index"
```

---

## Task 15: donate.html — PayPal Integration & Page Banner

**Files:**
- Modify: `donate.html`

- [ ] **Step 1: Add `data-page="donate"` to `<body>` to suppress the FAB**

Find:
```html
<body>
```
Replace with:
```html
<body data-page="donate">
```

- [ ] **Step 2: Replace font link**

Find:
```html
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
```
Replace with:
```html
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Poppins:wght@400;500;600&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
```

- [ ] **Step 3: Replace the entire `<main>` content**

Find the entire `<main>` block:
```html
  <main id="main-content">

    <div class="donate-hero">
      <div class="container">
        <h1>Make a Difference</h1>
        <p style="font-size: 1.25rem; opacity: 0.9; max-width: 600px; margin-inline: auto;">Your donation funds the programs, materials, and events that make our library a true community hub.</p>
      </div>
    </div>

    <section class="section">
      <div class="container" style="max-width: 720px;">
        <h2>Why Your Gift Matters</h2>
        <!--
          CONTENT: impact statement (1–3 paragraphs) — supplied by organization.
          Partners must confirm the external donation platform URL before launch.
        -->
        <p><!-- CONTENT: impact paragraph 1 --></p>
        <p><!-- CONTENT: impact paragraph 2 --></p>
        <p><!-- CONTENT: impact paragraph 3 (optional) --></p>
      </div>
    </section>

    <section class="donate-cta">
      <div class="container">
        <!--
          SETUP: Replace the href below with the confirmed external donation platform URL.
          Options: PayPal, GoFundMe, Donorbox, or equivalent.
          Opens in a new tab per spec.
        -->
        <a
          href="https://REPLACE_WITH_DONATION_PLATFORM_URL"
          class="btn btn--donate"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Donate Now — opens external donation page in a new tab"
        >
          Donate Now
        </a>
        <p style="margin-top: 1rem; color: var(--color-text-muted); font-size: 0.875rem;">
          You will be redirected to our secure donation partner. No payment information is collected on this site.
        </p>
      </div>
    </section>

  </main>
```
Replace with:
```html
  <main id="main-content">

    <section class="page-banner">
      <div class="container">
        <h1>Make a Donation</h1>
        <p class="page-banner__subtitle">Your gift directly supports the Anoka County Library</p>
      </div>
    </section>

    <section class="section">
      <div class="container" style="max-width: 720px;">
        <h2>Why Your Gift Matters</h2>
        <!--
          CONTENT: impact statement (1–3 paragraphs) — supplied by organization.
        -->
        <p><!-- CONTENT: impact paragraph 1 --></p>
        <p><!-- CONTENT: impact paragraph 2 --></p>
        <p><!-- CONTENT: impact paragraph 3 (optional) --></p>
      </div>
    </section>

    <section class="donate-section">
      <div class="container">
        <!--
          PAYPAL DONATE BUTTON
          SETUP: Replace REPLACE_WITH_YOUR_BUTTON_ID with your PayPal hosted button ID.
          Generate at: paypal.com → Merchant Services → PayPal Buttons → Donate
          The hosted_button_id is found in the code snippet PayPal provides.
        -->
        <form action="https://www.paypal.com/donate" method="post" target="_top">
          <input type="hidden" name="hosted_button_id" value="REPLACE_WITH_YOUR_BUTTON_ID">
          <button type="submit" class="btn--paypal">
            Donate with PayPal
          </button>
        </form>
        <p style="margin-top: 1rem; color: var(--color-text-muted); font-size: 0.875rem;">
          You will be redirected to PayPal to complete your donation securely.
        </p>
        <!--
          CONTENT: confirm 501(c)(3) status with board before publishing this line.
          <p style="font-size: 0.875rem; color: var(--color-text-muted);">
            Friends of the Anoka County Library is a 501(c)(3) nonprofit organization.
            Your donation may be tax-deductible.
          </p>
        -->
      </div>
    </section>

  </main>
```

- [ ] **Step 4: Run tests**

```bash
npx playwright test tests/pages.spec.js --reporter=line
```
Expected: donate page test passes.

- [ ] **Step 5: Commit**

```bash
git add donate.html
git commit -m "feat: add PayPal donate form and page banner to donate.html; suppress FAB via data-page"
```

---

## Task 16: Full Test Suite

- [ ] **Step 1: Run the complete test suite**

```bash
npx playwright test --reporter=line
```
Expected: all tests pass. 0 failures.

- [ ] **Step 2: If any test fails, read the error carefully**

Common issues to check:
- A font link was missed on a page (grep: `Open+Sans`)
- A page-banner `h1` has an unexpected text mismatch
- A `<h1>` left behind in page body below the banner (duplicate h1)
- FAB appears on donate page (check `data-page="donate"` is on `<body>`, not `<main>`)

Fix the failing file, re-run the failing test in isolation:
```bash
npx playwright test tests/pages.spec.js -g "donate page" --reporter=line
```

- [ ] **Step 3: Commit final fixes if any**

```bash
git add -p
git commit -m "fix: resolve remaining test failures from redesign"
```

- [ ] **Step 4: Final verification — confirm no Open Sans references remain in HTML**

```bash
grep -r "Open+Sans" --include="*.html" .
```
Expected: no output (grep finds nothing).

- [ ] **Step 5: Final commit confirming redesign complete**

```bash
git add .
git commit -m "chore: verify redesign complete — all tests passing, Open Sans removed"
```
