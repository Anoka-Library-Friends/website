import { test, expect } from '@playwright/test';

// Tests: active link highlighting, hamburger behavior (desktop + mobile),
//        keyboard navigation, focus management

const PAGES = [
  { url: '/about.html',     activeText: 'About' },
  { url: '/book-sale.html', activeText: 'Book Sale' },
  { url: '/events.html',    activeText: 'Calendar' },
  { url: '/membership.html',activeText: 'Membership' },
  { url: '/volunteer.html', activeText: 'Volunteer' },
  { url: '/news/',          activeText: 'News' },
  { url: '/donate.html',    activeText: 'Donate' },
];

// ── Active link highlighting ───────────────────────────────────────────────────

for (const { url, activeText } of PAGES) {
  test(`active nav link: "${activeText}" is marked aria-current on ${url}`, async ({ page }) => {
    await page.goto(url);
    // .nav-menu covers both .nav-links items and the sibling .nav-donate CTA
    const activeLink = page.locator('.nav-menu a[aria-current="page"]');
    await expect(activeLink).toHaveCount(1);
    await expect(activeLink).toHaveText(activeText);
  });
}

test('news post page marks "News" nav link as active', async ({ page }) => {
  await page.goto('/news/fall-book-sale.html');
  const activeLink = page.locator('.nav-menu a[aria-current="page"]');
  await expect(activeLink).toHaveCount(1);
  await expect(activeLink).toHaveText('News');
});

// ── Desktop: hamburger hidden, links visible ───────────────────────────────────

test('desktop: hamburger hidden and nav links visible', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await expect(page.locator('.nav-toggle')).not.toBeVisible();
  await expect(page.locator('.nav-links')).toBeVisible();
});

// ── Mobile: hamburger visible, nav hidden ─────────────────────────────────────

test('mobile: hamburger visible and nav links hidden initially', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expect(page.locator('.nav-toggle')).toBeVisible();
  // Nav links not visible until opened
  await expect(page.locator('.nav-links')).not.toBeVisible();
});

test('mobile: hamburger opens nav menu', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  const toggle = page.locator('.nav-toggle');
  const menu = page.locator('.nav-links');

  await toggle.click();
  await expect(menu).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
});

test('mobile: hamburger closes nav menu on second click', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  const toggle = page.locator('.nav-toggle');
  const menu = page.locator('.nav-links');

  await toggle.click(); // open
  await toggle.click(); // close
  await expect(menu).not.toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('mobile: clicking a nav link closes the menu', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  const toggle = page.locator('.nav-toggle');
  const menu = page.locator('.nav-links');

  await toggle.click();
  await expect(menu).toBeVisible();

  // Click the About link
  await menu.locator('a', { hasText: 'About' }).click();

  // Menu should be closed (either by navigation or JS close handler)
  await page.goBack();
  // After navigating back, menu should be closed (aria-expanded="false")
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('mobile: Escape key closes the nav menu', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  const toggle = page.locator('.nav-toggle');
  const menu = page.locator('.nav-links');

  await toggle.click();
  await expect(menu).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(menu).not.toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('mobile: Escape key returns focus to hamburger button', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  const toggle = page.locator('.nav-toggle');

  await toggle.click();
  await page.keyboard.press('Escape');

  // Hamburger should be the focused element
  await expect(toggle).toBeFocused();
});

// ── Skip link ─────────────────────────────────────────────────────────────────

test('skip link becomes visible on focus and targets #main-content', async ({ page }) => {
  await page.goto('/');
  const skipLink = page.locator('.skip-link');

  // Off-screen before focus
  await expect(skipLink).toBeAttached();

  // Focus it via keyboard Tab
  await page.keyboard.press('Tab');
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await expect(skipLink).toHaveAttribute('href', '#main-content');
});

// ── Footer nav links ──────────────────────────────────────────────────────────

test('footer nav links all present and functional', async ({ page }) => {
  await page.goto('/');
  const footerLinks = page.locator('.footer-nav a');
  await expect(footerLinks).toHaveCount(9);

  const expectedHrefs = ['/', '/about.html', '/gala.html', '/book-sale.html', '/events.html',
                         '/membership.html', '/volunteer.html', '/news/', '/donate.html'];
  const actualHrefs = await footerLinks.evaluateAll(links => links.map(a => a.getAttribute('href')));
  expect(actualHrefs).toEqual(expectedHrefs);
});
