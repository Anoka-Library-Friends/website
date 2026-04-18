# Color Palette Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing muted earthy palette with a Deep Forest green + Bright/Amber Gold palette across all site sections.

**Architecture:** All color changes are isolated to `pages/style.css` (token definitions in `:root` + component overrides) and `tests/accessibility.spec.js` (two hardcoded color assertions). No HTML changes are needed unless CTA band button classes require updating (Task 6 checks this). Changes cascade automatically from token updates wherever the old token name is preserved; places using removed token names (`--color-teal`, `--color-sky`, `--color-seaweed`) require explicit find-and-replace.

**Tech Stack:** Plain CSS custom properties, Playwright + axe-core for WCAG validation.

---

## File Map

| File | Change |
|---|---|
| `pages/style.css` | Update `:root` tokens; update component CSS referencing removed tokens |
| `tests/accessibility.spec.js` | Update two hardcoded `rgb(...)` assertions for body/muted text colors |

---

### Task 1: Update `:root` design tokens

**Files:**
- Modify: `pages/style.css:19-63`

- [ ] **Step 1: Replace the entire `:root` block**

Replace lines 19–63 (from `/* ── Brand Colors` through `--radius-lg: 8px;`) with:

```css
:root {
  /* ── Brand Colors ────────────────────────────────────────────────────────── */
  --color-primary:      #1E4020;  /* Deep Forest — nav, buttons, headings */
  --color-primary-dark: #122514;  /* Dark Forest — hover states, hero gradient end */
  --color-forest:       #2B5329;  /* Forest — news/blog section band */
  --color-gold:         #F5BC1C;  /* Bright Gold — nav donate button, hero CTA */
  --color-gold-dark:    #E8B014;  /* Amber Gold — join CTA band background */
  --color-sage:         #C0E8A0;  /* Sage — nav links, hero subtext, footer links */
  --color-sage-light:   #DFF0D0;  /* Light Sage — alt section backgrounds */
  --color-bg:           #FDFAF4;  /* Warm Cream — page background */
  --color-dark:         #0D1C0E;  /* Near Black — footer */
  --color-text:         #1E2E1A;  /* Dark forest-brown — body text */
  --color-text-muted:   #556650;  /* Muted green-gray — muted text (≥4.5:1 on --color-bg) */
  --color-border:       #ddd8d0;  /* Neutral warm border */
  --color-focus:        #ECE331;  /* Yellow — high-contrast focus ring (WCAG AA) */

  /* ── Backward-compat aliases ─────────────────────────────────────────────── */
  --color-accent:       var(--color-primary);
  --color-accent-dark:  var(--color-primary-dark);

  /* ── Typography (update @import in HTML if font names change) ────────────── */
  --font-heading: 'Montserrat', Arial, sans-serif;
  --font-body:    'Poppins', Arial, Helvetica, sans-serif;
  --font-serif:   'Merriweather', Georgia, serif;

  /* ── Scale & Spacing ─────────────────────────────────────────────────────── */
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

- [ ] **Step 2: Commit**

```bash
git add pages/style.css
git commit -m "refactor: update design tokens to Forest & Gold palette"
```

---

### Task 2: Update global link colors

**Files:**
- Modify: `pages/style.css` (the `a` and `a:hover` rules near line 100)

The global link color uses the removed `--color-seaweed` token; hover uses `--color-teal`.

- [ ] **Step 1: Update the `a` color rule**

Find:
```css
a {
  color: var(--color-seaweed);
  text-decoration: none;
}
```
Replace with:
```css
a {
  color: var(--color-primary);
  text-decoration: none;
}
```

- [ ] **Step 2: Update the `a:hover` color rule**

Find:
```css
a:hover {
  color: var(--color-teal);
}
```
Replace with:
```css
a:hover {
  color: var(--color-primary-dark);
}
```

- [ ] **Step 3: Update the `.section--alt a:not(.btn)` link override**

Find:
```css
.section--alt a:not(.btn) {
  color: var(--color-teal);  /* #415C5C — 5.1:1 on #CFE1E0 (passes WCAG AA) */
}

.section--alt a:not(.btn):hover {
  color: var(--color-primary-dark);
}
```
Replace with:
```css
.section--alt a:not(.btn) {
  color: var(--color-primary);  /* #1E4020 — passes WCAG AA on --color-sage-light */
}

.section--alt a:not(.btn):hover {
  color: var(--color-primary-dark);
}
```

- [ ] **Step 4: Commit**

```bash
git add pages/style.css
git commit -m "refactor: update global link colors to forest green"
```

---

### Task 3: Update navigation colors

**Files:**
- Modify: `pages/style.css` (nav section, around lines 322–498)

The nav links use `--color-sky`; the donate button uses `--color-bg` background (cream). Both need updating.

- [ ] **Step 1: Update nav link text color**

Find:
```css
.nav-links a {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: var(--font-size-sm);
  text-decoration: none;
  color: var(--color-sky);
```
Replace `color: var(--color-sky);` with `color: var(--color-sage);`

- [ ] **Step 2: Update the nav donate button**

Find:
```css
.nav-links .nav-donate {
  background: var(--color-bg);
  color: var(--color-primary);
  padding: 0.4rem 1rem;
  border-radius: var(--radius);
  font-weight: 700;
  margin-left: var(--space-md);
}

.nav-links .nav-donate:hover {
  background: white;
  color: var(--color-primary-dark);
}
```
Replace with:
```css
.nav-links .nav-donate {
  background: var(--color-gold);
  color: #1a2e1b;
  padding: 0.4rem 1rem;
  border-radius: var(--radius);
  font-weight: 700;
  margin-left: var(--space-md);
}

.nav-links .nav-donate:hover {
  background: var(--color-gold-dark);
  color: #1a2e1b;
}
```

- [ ] **Step 3: Update nav donate on donate page (active state)**

Find:
```css
.nav-links .nav-donate[aria-current="page"] {
  color: var(--color-primary);
  text-decoration: none;
}
```
Replace with:
```css
.nav-links .nav-donate[aria-current="page"] {
  color: #1a2e1b;
  text-decoration: none;
}
```

- [ ] **Step 4: Commit**

```bash
git add pages/style.css
git commit -m "refactor: update nav link and donate button to gold palette"
```

---

### Task 4: Update hero and page-banner gradients

**Files:**
- Modify: `pages/style.css` (hero ~line 618, page-banner ~line 831)

Both gradients currently use the removed `--color-teal` token.

- [ ] **Step 1: Update hero gradient**

Find:
```css
.hero {
  background: linear-gradient(135deg, var(--color-teal) 0%, var(--color-dark) 100%);
```
Replace with:
```css
.hero {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
```

- [ ] **Step 2: Update hero eyebrow and paragraph colors**

Find:
```css
.hero__eyebrow {
  font-family: var(--font-heading);
  font-size: var(--font-size-sm);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-sky);
  margin-bottom: var(--space-md);
}
```
Replace `color: var(--color-sky);` with `color: var(--color-sage);`

Find:
```css
.hero > .container > p {
  color: var(--color-sky);
```
Replace with:
```css
.hero > .container > p {
  color: var(--color-sage);
```

- [ ] **Step 3: Update page-banner gradient**

Find:
```css
.page-banner {
  background: linear-gradient(135deg, var(--color-teal) 0%, var(--color-dark) 100%);
```
Replace with:
```css
.page-banner {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
```

- [ ] **Step 4: Update page-banner subtitle color**

Find:
```css
.page-banner__subtitle {
  color: var(--color-sky);
```
Replace with:
```css
.page-banner__subtitle {
  color: var(--color-sage);
```

- [ ] **Step 5: Commit**

```bash
git add pages/style.css
git commit -m "refactor: update hero and page-banner to forest green gradient"
```

---

### Task 4b: Add `.btn--gold` class and update hero CTA button

**Files:**
- Modify: `pages/style.css` (buttons section, after `.btn--hero-outline`)
- Modify: `pages/index.html` (hero `<a>` element)

The hero CTA must be gold (`#F5BC1C`) on the dark green hero background. `.btn--primary` (now forest green) would be invisible against the dark green hero gradient. A dedicated `.btn--gold` class is needed.

- [ ] **Step 1: Add `.btn--gold` to style.css after `.btn--hero-outline` block**

```css
/* Gold — for use on dark backgrounds (hero, dark section bands) */
.btn--gold {
  background: var(--color-gold);
  color: #1a2e1b;
  border-color: var(--color-gold);
  font-family: var(--font-heading);
  font-weight: 700;
}

.btn--gold:hover,
.btn--gold:focus-visible {
  background: var(--color-gold-dark);
  border-color: var(--color-gold-dark);
  color: #1a2e1b;
}
```

- [ ] **Step 2: Find the primary CTA button in the hero HTML**

```bash
grep -n "btn" pages/index.html | head -20
```

Look for the `<a class="btn ...">Become a Member` or similar inside the `.hero__actions` div.

- [ ] **Step 3: Replace the hero primary CTA button class**

If it currently uses `btn--primary` or `btn--cream`, change it to `btn--gold`:

```html
<!-- Before -->
<a href="/membership.html" class="btn btn--primary">Become a Member</a>

<!-- After -->
<a href="/membership.html" class="btn btn--gold">Become a Member</a>
```

Leave the secondary hero button (`btn--hero-outline`) unchanged.

- [ ] **Step 4: Commit**

```bash
git add pages/style.css pages/index.html
git commit -m "feat: add btn--gold class, apply to hero CTA button"
```

---

### Task 5: Update section band backgrounds

**Files:**
- Modify: `pages/style.css` (section--alt ~line 163, section--teal ~line 951, cta-band ~line 966)

- [ ] **Step 1: Update `.section--alt` background**

Find:
```css
.section--alt {
  background: var(--color-sky);
```
Replace with:
```css
.section--alt {
  background: var(--color-sage-light);
```

- [ ] **Step 2: Update `.section--teal` background**

Find:
```css
.section--teal {
  background: var(--color-teal);
}
```
Replace with:
```css
.section--teal {
  background: var(--color-forest);
}
```

- [ ] **Step 3: Update CTA band background and text colors**

Find:
```css
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
```
Replace with:
```css
.cta-band {
  background: var(--color-gold-dark);
  text-align: center;
  padding-block: var(--space-xl);
}

.cta-band h2 {
  color: #1a2e1b;
  font-family: var(--font-heading);
  font-weight: 800;
  margin-bottom: var(--space-md);
}

.cta-band p {
  color: #2E4A2A;
  margin-bottom: var(--space-lg);
  max-width: 560px;
  margin-inline: auto;
}
```

- [ ] **Step 4: Commit**

```bash
git add pages/style.css
git commit -m "refactor: update section band backgrounds to new palette"
```

---

### Task 6: Update events strip and footer colors

**Files:**
- Modify: `pages/style.css` (events strip ~line 934, footer ~line 503)

- [ ] **Step 1: Update events strip "View all" link**

Find:
```css
.events-strip__link {
  display: inline-block;
  margin-top: var(--space-md);
  color: var(--color-seaweed);
```
Replace with:
```css
.events-strip__link {
  display: inline-block;
  margin-top: var(--space-md);
  color: var(--color-primary);
```

Find:
```css
.events-strip__link:hover {
  color: var(--color-teal);
}
```
Replace with:
```css
.events-strip__link:hover {
  color: var(--color-primary-dark);
}
```

- [ ] **Step 2: Update footer link colors**

Find:
```css
.site-footer {
  background: var(--color-dark);
  color: var(--color-sky);
```
Replace with:
```css
.site-footer {
  background: var(--color-dark);
  color: var(--color-sage);
```

Find:
```css
.site-footer a {
  color: var(--color-sky);
}
```
Replace with:
```css
.site-footer a {
  color: var(--color-sage);
}
```

- [ ] **Step 3: Check whether CTA band HTML uses `.btn--cream`**

Run:
```bash
grep -n "btn--cream\|cta-band" pages/index.html
```

If `.btn--cream` appears inside `.cta-band`, replace it with `.btn--primary` (forest green bg, white text) in that HTML file. `.btn--cream` was designed for dark/primary backgrounds; `.btn--primary` looks correct on amber gold.

If `.btn--outline` appears inside `.cta-band`, leave it — `--color-primary` border/text on amber gold works fine.

- [ ] **Step 4: Commit**

```bash
git add pages/style.css pages/index.html
git commit -m "refactor: update events strip and footer to forest green palette"
```

---

### Task 7: Update accessibility test color assertions

**Files:**
- Modify: `tests/accessibility.spec.js:55-72`

Two tests assert specific RGB values for color tokens. These must be updated to match the new token values.

- [ ] **Step 1: Update body text color assertion**

New `--color-text` is `#1E2E1A` = `rgb(30, 46, 26)`.

Find:
```js
test('body text color token is dark enough for WCAG AA', async ({ page }) => {
  await page.goto('/');
  // --color-text is #422E1D — verify it's applied to body
  const bodyColor = await page.evaluate(() =>
    getComputedStyle(document.body).color
  );
  // rgb(66, 46, 29) = #422E1D, contrast >7:1 on --color-bg (#F8F5EC)
  expect(bodyColor).toBe('rgb(66, 46, 29)');
});
```
Replace with:
```js
test('body text color token is dark enough for WCAG AA', async ({ page }) => {
  await page.goto('/');
  // --color-text is #1E2E1A — verify it's applied to body
  const bodyColor = await page.evaluate(() =>
    getComputedStyle(document.body).color
  );
  // rgb(30, 46, 26) = #1E2E1A, contrast >14:1 on --color-bg (#FDFAF4)
  expect(bodyColor).toBe('rgb(30, 46, 26)');
});
```

- [ ] **Step 2: Update muted text color assertion**

New `--color-text-muted` is `#556650` = `rgb(85, 102, 80)`.

Find:
```js
test('muted text color token is readable on page background', async ({ page }) => {
  await page.goto('/blog/');
  // .card__date uses --color-text-muted (#6B5B4F), contrast ≥4.5:1 on --color-bg
  const mutedColor = await page.evaluate(() => {
    const el = document.querySelector('.card__date');
    return el ? getComputedStyle(el).color : null;
  });
  expect(mutedColor).toBe('rgb(107, 91, 79)');
});
```
Replace with:
```js
test('muted text color token is readable on page background', async ({ page }) => {
  await page.goto('/blog/');
  // .card__date uses --color-text-muted (#556650), contrast ≥5.9:1 on --color-bg (#FDFAF4)
  const mutedColor = await page.evaluate(() => {
    const el = document.querySelector('.card__date');
    return el ? getComputedStyle(el).color : null;
  });
  expect(mutedColor).toBe('rgb(85, 102, 80)');
});
```

- [ ] **Step 3: Commit**

```bash
git add tests/accessibility.spec.js
git commit -m "test: update color assertions for new Forest & Gold palette"
```

---

### Task 8: Run full test suite and verify

**Files:** None — verification only.

- [ ] **Step 1: Build the site**

```bash
npm run build
```
Expected: no errors, `pages/` output generated.

- [ ] **Step 2: Run unit tests**

```bash
npm test
```
Expected: all passing.

- [ ] **Step 3: Run Playwright tests**

```bash
npx playwright test
```
Expected: all tests pass, including the axe WCAG 2.1 AA scans. If a contrast violation appears in the axe output, note the failing element and color pair, then adjust the relevant token value in `:root` until it passes (4.5:1 for normal text, 3:1 for large text/UI components).

- [ ] **Step 4: Do a visual spot-check**

```bash
npm run screenshot
```
Open the screenshots and verify: nav is deep forest green with gold donate button, hero is a dark green gradient, CTA band is amber gold with dark green buttons, footer is near-black with sage links.

- [ ] **Step 5: Final commit if any contrast fixes were made**

```bash
git add pages/style.css
git commit -m "fix: adjust token values to pass WCAG contrast checks"
```
