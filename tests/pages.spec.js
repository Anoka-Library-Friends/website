import { test, expect } from '@playwright/test';

// Pages covered: all 7 static pages + generated blog posts
// Tests: title, h1, skip link, full nav presence, footer year,
//        page-specific content, external link attributes, build output

const NAV_LINKS = [
  { text: 'Home',             href: '/' },
  { text: 'About & Contact',  href: '/about.html' },
  { text: 'Events',           href: '/events.html' },
  { text: 'Membership',       href: '/membership.html' },
  { text: 'Volunteer',        href: '/volunteer.html' },
  { text: 'Blog',             href: '/blog/' },
  { text: 'Donate',           href: '/donate.html' },
];

// ── Shared helpers ────────────────────────────────────────────────────────────

async function checkSharedElements(page) {
  // Skip link is present (may not be visible until focused)
  await expect(page.locator('.skip-link')).toHaveAttribute('href', '#main-content');

  // All nav links present
  for (const link of NAV_LINKS) {
    await expect(
      page.locator('.nav-links a', { hasText: link.text }).first()
    ).toBeVisible();
  }

  // Footer year is the current year
  const year = String(new Date().getFullYear());
  await expect(page.locator('#footer-year')).toHaveText(year);
}

// ── index.html ────────────────────────────────────────────────────────────────

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

// ── about.html ────────────────────────────────────────────────────────────────

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

// ── events.html ───────────────────────────────────────────────────────────────

test('events page: title, h1, calendar iframe with title and loading attrs', async ({ page }) => {
  await page.goto('/events.html');
  await expect(page).toHaveTitle(/Events/);
  await expect(page.locator('h1')).toHaveText('Events');
  await checkSharedElements(page);

  // Calendar iframe must have accessible title and lazy loading
  const iframe = page.locator('iframe');
  await expect(iframe).toHaveAttribute('title', /events calendar/i);
  await expect(iframe).toHaveAttribute('loading', 'lazy');

  // Wrapped in accessible region
  await expect(page.locator('[role="region"][aria-label]').filter({ has: iframe })).toBeAttached();
});

// ── membership.html ───────────────────────────────────────────────────────────

test('membership page: title, h1, three tier cards, featured tier, mailto links', async ({ page }) => {
  await page.goto('/membership.html');
  await expect(page).toHaveTitle(/Membership/);
  await expect(page.locator('h1')).toHaveText('Membership');
  await checkSharedElements(page);

  // Three tier cards
  await expect(page.locator('.tier')).toHaveCount(3);

  // Exactly one featured tier
  await expect(page.locator('.tier--featured')).toHaveCount(1);
  await expect(page.locator('.tier--featured h3')).toHaveText('Family');

  // All Join buttons use mailto (no external form)
  const joinBtns = page.locator('.tier .btn');
  await expect(joinBtns).toHaveCount(3);
  for (const btn of await joinBtns.all()) {
    const href = await btn.getAttribute('href');
    expect(href).toMatch(/^mailto:/);
  }
});

// ── donate.html ───────────────────────────────────────────────────────────────

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

// ── volunteer.html ────────────────────────────────────────────────────────────

test('volunteer page: title, h1, injected opportunity card, sign-up button', async ({ page }) => {
  await page.goto('/volunteer.html');
  await expect(page).toHaveTitle(/Volunteer/);
  await expect(page.locator('h1')).toHaveText('Volunteer Opportunities');
  await checkSharedElements(page);

  // Build should have injected the sample opportunity
  const card = page.locator('.volunteer-card');
  await expect(card).toHaveCount(1);
  await expect(card.locator('h2')).toHaveText('Book Sale Setup Crew');

  // Sign Up button opens external link safely
  const signUpBtn = card.locator('a.btn');
  await expect(signUpBtn).toHaveAttribute('target', '_blank');
  await expect(signUpBtn).toHaveAttribute('rel', /noopener/);
  await expect(signUpBtn).toHaveAttribute('aria-label', /sign up/i);
});

// ── blog/index.html ───────────────────────────────────────────────────────────

test('blog index: title, h1, injected post list with three sample posts', async ({ page }) => {
  await page.goto('/blog/');
  await expect(page).toHaveTitle(/Blog/);
  await expect(page.locator('h1')).toHaveText('Blog');
  await checkSharedElements(page);

  // Build injected 3 sample blog posts
  const articles = page.locator('article.card');
  await expect(articles).toHaveCount(3);

  // Each card has a title link and a Read More link
  for (const article of await articles.all()) {
    await expect(article.locator('.card__title a')).toBeVisible();
    await expect(article.locator('a', { hasText: 'Read More' })).toBeVisible();
  }
});

// ── generated blog post pages ─────────────────────────────────────────────────

const BLOG_POSTS = [
  {
    slug: 'welcome-to-our-new-website',
    title: 'Welcome to Our New Website',
    author: 'Friends of the Library Board',
  },
  {
    slug: 'annual-book-sale-2026',
    title: 'Annual Book Sale — April 2026',
    author: 'Friends of the Library Board',
  },
  {
    slug: 'summer-reading-program-recap',
    title: 'Summer Reading Program Recap',
    author: 'Jane Smith',
  },
];

for (const post of BLOG_POSTS) {
  test(`blog post "${post.title}": h1, author, date, body, back link`, async ({ page }) => {
    await page.goto(`/blog/${post.slug}.html`);
    await expect(page).toHaveTitle(new RegExp(post.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

    // Heading
    await expect(page.locator('h1')).toHaveText(post.title);

    // Meta: author name appears somewhere in the meta block
    await expect(page.locator('.blog-post__meta')).toContainText(post.author);

    // Body content rendered (not empty)
    await expect(page.locator('.blog-post__body')).not.toBeEmpty();

    // Back link
    await expect(page.locator('a', { hasText: 'Back to all posts' })).toHaveAttribute('href', '/blog/');

    // Nav and footer still present
    await checkSharedElements(page);
  });
}

// ── recent posts on home page link to correct post pages ─────────────────────

test('home page: recent post links navigate to correct blog post pages', async ({ page }) => {
  await page.goto('/');
  const recentSection = page.locator('section').filter({ hasText: 'Latest News' });
  const postLinks = recentSection.locator('article a').filter({ hasText: 'Read More' });
  const hrefs = await postLinks.evaluateAll(links => links.map(a => a.getAttribute('href')));

  // Each href points to a valid /blog/*.html page
  for (const href of hrefs) {
    expect(href).toMatch(/^\/blog\/.+\.html$/);
    await page.goto(href);
    await expect(page.locator('h1')).not.toBeEmpty();
  }
});

// ── Donate nav link is visually distinct ─────────────────────────────────────

test('donate nav link has nav-donate class for accent styling', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.nav-links a.nav-donate')).toBeVisible();
  await expect(page.locator('.nav-links a.nav-donate')).toHaveAttribute('href', '/donate.html');
});
