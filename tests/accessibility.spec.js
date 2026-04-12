import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// axe-core WCAG 2.1 AA scan on every page.
// Known acceptable patterns are excluded with comments explaining why.

const PAGES = [
  { name: 'home',           url: '/' },
  { name: 'about',          url: '/about.html' },
  { name: 'events',         url: '/events.html' },
  { name: 'membership',     url: '/membership.html' },
  { name: 'donate',         url: '/donate.html' },
  { name: 'volunteer',      url: '/volunteer.html' },
  { name: 'blog index',     url: '/blog/' },
  { name: 'blog post',      url: '/blog/welcome-to-our-new-website.html' },
];

for (const { name, url } of PAGES) {
  test(`${name}: zero axe WCAG 2.1 AA violations`, async ({ page }) => {
    await page.goto(url);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Surface violations clearly in test output
    if (results.violations.length > 0) {
      const summary = results.violations.map(v =>
        `[${v.impact}] ${v.id}: ${v.description}\n  Nodes: ${v.nodes.map(n => n.html).join(', ')}`
      ).join('\n\n');
      expect.soft(results.violations, `Accessibility violations on ${url}:\n${summary}`).toHaveLength(0);
    }

    expect(results.violations).toHaveLength(0);
  });
}

// ── Color contrast spot-checks ────────────────────────────────────────────────
// axe checks contrast automatically; these tests verify specific token usage
// didn't accidentally drop below 4.5:1.

test('body text color token is dark enough for WCAG AA', async ({ page }) => {
  await page.goto('/');
  // --color-text is #422E1D — verify it's applied to body
  const bodyColor = await page.evaluate(() =>
    getComputedStyle(document.body).color
  );
  // rgb(66, 46, 29) = #422E1D, contrast >7:1 on --color-bg (#F8F5EC)
  expect(bodyColor).toBe('rgb(66, 46, 29)');
});

test('muted text color token is readable on white background', async ({ page }) => {
  await page.goto('/blog/');
  // .card__date uses --color-text-muted (#6B5B4F), contrast ≥4.5:1 on --color-bg
  const mutedColor = await page.evaluate(() => {
    const el = document.querySelector('.card__date');
    return el ? getComputedStyle(el).color : null;
  });
  expect(mutedColor).toBe('rgb(107, 91, 79)');
});

// ── Focus visibility ──────────────────────────────────────────────────────────

test('focus ring visible on primary button', async ({ page }) => {
  await page.goto('/membership.html');
  const btn = page.locator('.tier--featured .btn').first();
  await btn.focus();
  const outline = await btn.evaluate(el => getComputedStyle(el).outlineStyle);
  // Outline should not be 'none' when focused
  expect(outline).not.toBe('none');
});

test('focus ring visible on nav links', async ({ page }) => {
  await page.goto('/');
  // Tab to skip link, then Tab again to reach first nav link
  await page.keyboard.press('Tab'); // skip link
  await page.keyboard.press('Tab'); // first nav link (Home)
  const focused = page.locator(':focus');
  const outlineStyle = await focused.evaluate(el => getComputedStyle(el).outlineStyle);
  expect(outlineStyle).not.toBe('none');
});

// ── ARIA correctness ──────────────────────────────────────────────────────────

test('all nav elements have aria-label', async ({ page }) => {
  await page.goto('/');
  const navs = page.locator('nav');
  for (const nav of await navs.all()) {
    const label = await nav.getAttribute('aria-label');
    expect(label, 'Every <nav> must have an aria-label').toBeTruthy();
  }
});

test('hamburger button has required ARIA attributes', async ({ page }) => {
  await page.goto('/');
  const toggle = page.locator('.nav-toggle');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toHaveAttribute('aria-controls', 'nav-menu');
  await expect(toggle).toHaveAttribute('aria-label');
});

test('all img tags have alt attributes', async ({ page }) => {
  for (const { url } of PAGES) {
    await page.goto(url);
    const imgs = page.locator('img');
    for (const img of await imgs.all()) {
      const alt = await img.getAttribute('alt');
      expect(alt, `img missing alt on ${url}`).not.toBeNull();
    }
  }
});

test('calendar iframe has accessible title', async ({ page }) => {
  await page.goto('/events.html');
  const iframe = page.locator('iframe');
  const title = await iframe.getAttribute('title');
  expect(title).toBeTruthy();
});

test('external links with target="_blank" have noopener rel', async ({ page }) => {
  for (const { url } of PAGES) {
    await page.goto(url);
    const newTabLinks = page.locator('a[target="_blank"]');
    for (const link of await newTabLinks.all()) {
      const rel = await link.getAttribute('rel');
      expect(rel, `target="_blank" link missing rel="noopener" on ${url}`).toMatch(/noopener/);
    }
  }
});

// ── Heading hierarchy ─────────────────────────────────────────────────────────

test('no page has more than one h1', async ({ page }) => {
  for (const { url } of PAGES) {
    await page.goto(url);
    await expect(page.locator('h1'), `Multiple h1 on ${url}`).toHaveCount(1);
  }
});

test('no heading levels are skipped', async ({ page }) => {
  for (const { url } of PAGES) {
    await page.goto(url);
    const levels = await page.evaluate(() => {
      const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')];
      return headings.map(h => parseInt(h.tagName.slice(1)));
    });

    for (let i = 1; i < levels.length; i++) {
      const diff = levels[i] - levels[i - 1];
      expect(diff, `Heading level skipped on ${url}: h${levels[i-1]} → h${levels[i]}`).toBeLessThanOrEqual(1);
    }
  }
});

// ── Language declaration ──────────────────────────────────────────────────────

test('all pages declare lang="en"', async ({ page }) => {
  for (const { url } of PAGES) {
    await page.goto(url);
    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang, `Missing lang attribute on ${url}`).toBe('en');
  }
});
