import { test, expect } from '@playwright/test';

// Pages covered: all 7 static pages + generated news posts
// Tests: title, h1, skip link, full nav presence, footer year,
//        page-specific content, external link attributes, build output

const NAV_LINKS = [
  { text: 'Home',             href: '/' },
  { text: 'About',  href: '/about.html' },
  { text: 'Events',           href: '/events.html' },
  { text: 'Membership',       href: '/membership.html' },
  { text: 'Volunteer',        href: '/volunteer.html' },
  { text: 'News',             href: '/news/' },
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
  await expect(eventsSection.locator('.event-item')).toHaveCount(2);
  await expect(eventsSection.locator('.events-strip__link')).toHaveAttribute('href', '/events.html');

  // Recent posts section — three blog cards
  const recentSection = page.locator('.section--teal');
  await expect(recentSection.locator('article')).toHaveCount(3);

  // CTA band — two cream buttons
  const ctaBand = page.locator('.cta-band');
  await expect(ctaBand).toBeVisible();
  await expect(ctaBand.locator('a.btn')).toHaveCount(2);

  // Donate FAB present on homepage, links to GiveMN one-click
  await expect(page.locator('.donate-fab')).toBeVisible();
  await expect(page.locator('.donate-fab')).toHaveAttribute('href', 'https://www.givemn.org/organization/Acl');
  await expect(page.locator('.donate-fab')).toHaveAttribute('target', '_blank');
});

// ── about.html ────────────────────────────────────────────────────────────────

test('about page: title, h1, page banner, sections, contact anchor', async ({ page }) => {
  await page.goto('/about.html');
  await expect(page).toHaveTitle(/About/);
  await expect(page.locator('h1')).toHaveText('About');
  await expect(page.locator('.page-banner')).toBeVisible();
  await checkSharedElements(page);

  // All four required sections present (now h2 since h1 is in the banner)
  await expect(page.locator('h2', { hasText: 'Our History' })).toBeVisible();
  await expect(page.locator('h2', { hasText: 'Board Members' })).toBeVisible();
  await expect(page.locator('h2', { hasText: 'Partners' })).toBeVisible();
  await expect(page.locator('strong', { hasText: 'Connect With Us' })).toBeVisible();

  // #contact anchor exists for deep-linking
  await expect(page.locator('#contact')).toBeAttached();

  // Donate FAB present
  await expect(page.locator('.donate-fab')).toBeVisible();
});

// ── events.html ───────────────────────────────────────────────────────────────

test('events page: title, h1, page banner, calendar iframe with title and loading attrs', async ({ page }) => {
  await page.goto('/events.html');
  await expect(page).toHaveTitle(/Events/);
  await expect(page.locator('h1')).toHaveText('Events & Programs');
  await expect(page.locator('.page-banner')).toBeVisible();
  await checkSharedElements(page);

  // Calendar iframe must have accessible title and lazy loading
  const iframe = page.locator('iframe');
  await expect(iframe).toHaveAttribute('title', /events calendar/i);
  await expect(iframe).toHaveAttribute('loading', 'lazy');

  // Wrapped in accessible region
  await expect(page.locator('[role="region"][aria-label]').filter({ has: iframe })).toBeAttached();
});

// ── membership.html ───────────────────────────────────────────────────────────

test('membership page: title, h1, page banner, Donate-to-Join CTA, GiveMN + PayPal links', async ({ page }) => {
  await page.goto('/membership.html');
  await expect(page).toHaveTitle(/Membership/);
  await expect(page.locator('h1')).toHaveText('Membership');
  await expect(page.locator('.page-banner')).toBeVisible();
  await checkSharedElements(page);

  // Donate-to-Join CTA in page banner
  const joinBtn = page.locator('.page-banner__cta a.btn');
  await expect(joinBtn).toBeVisible();
  await expect(joinBtn).toHaveText(/Donate to Join/i);
  await expect(joinBtn).toHaveAttribute('href', '/donate.html');

  // GiveMN + PayPal links are present in the main content
  // (excludes the donate FAB which also links to GiveMN)
  await expect(page.locator('main a[href*="givemn.org"]')).toHaveCount(1);
  await expect(page.locator('main a[href*="paypal.com"]')).toHaveCount(1);
});

// ── donate.html ───────────────────────────────────────────────────────────────

test('donate page: title, page banner, impact statement, donation methods, no FAB', async ({ page }) => {
  await page.goto('/donate.html');
  await expect(page).toHaveTitle(/Donate/);
  await expect(page.locator('h1')).toHaveText('Make a Donation');
  await expect(page.locator('.page-banner')).toBeVisible();
  await checkSharedElements(page);

  // Impact statement heading
  await expect(page.locator('h2', { hasText: 'Why Your Gift Matters' })).toBeVisible();

  // PayPal link
  const paypal = page.locator('a.btn--paypal[href*="paypal.com/donate"]');
  await expect(paypal).toBeVisible();
  await expect(paypal).toHaveAttribute('target', '_blank');

  // GiveMN link
  const givemn = page.locator('a.btn--paypal[href*="givemn.org"]');
  await expect(givemn).toBeVisible();

  // Mailing address
  const address = page.locator('.donate-address');
  await expect(address).toBeVisible();
  await expect(address).toContainText('707 County Hwy 10');
  await expect(address).toContainText('Blaine, MN 55434');

  // Security note below buttons
  await expect(page.locator('.donate-note')).toBeVisible();

  // Donate FAB must NOT appear on donate page
  await expect(page.locator('.donate-fab')).not.toBeAttached();
});

// ── volunteer.html ────────────────────────────────────────────────────────────

test('volunteer page: title, h1, page banner, injected opportunity card, sign-up button', async ({ page }) => {
  await page.goto('/volunteer.html');
  await expect(page).toHaveTitle(/Volunteer/);
  await expect(page.locator('h1')).toHaveText('Volunteer');
  await expect(page.locator('.page-banner')).toBeVisible();
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

// ── news/index.html ───────────────────────────────────────────────────────────

test('news index: title, h1, page banner, injected post list', async ({ page }) => {
  await page.goto('/news/');
  await expect(page).toHaveTitle(/News/);
  await expect(page.locator('h1')).toHaveText('Latest News');
  await expect(page.locator('.page-banner')).toBeVisible();
  await checkSharedElements(page);

  // Build injected at least one post
  const articles = page.locator('article.card');
  await expect(articles.first()).toBeVisible();

  // Each card has a title link and a Read More link
  for (const article of await articles.all()) {
    await expect(article.locator('.card__title a')).toBeVisible();
    await expect(article.locator('a', { hasText: 'Read More' })).toBeVisible();
  }
});

// ── generated news post pages ─────────────────────────────────────────────────

const NEWS_POSTS = [
  {
    slug: 'fall-book-sale',
    title: 'Fall Book Sale',
    author: 'Friends of the Library Board',
  },
  {
    slug: 'grant-awarded',
    title: 'Grant Awarded',
    author: 'Friends of the Library Board',
  },
];

for (const post of NEWS_POSTS) {
  test(`news post "${post.title}": h1, author, date, body, back link`, async ({ page }) => {
    await page.goto(`/news/${post.slug}.html`);
    await expect(page).toHaveTitle(new RegExp(post.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

    // Heading
    await expect(page.locator('h1')).toHaveText(post.title);

    // Meta: author name appears somewhere in the meta block
    await expect(page.locator('.news-post__meta')).toContainText(post.author);

    // Body content rendered (not empty)
    await expect(page.locator('.news-post__body')).not.toBeEmpty();

    // Back link
    await expect(page.locator('a', { hasText: 'Back to all posts' })).toHaveAttribute('href', '/news/');

    // Nav and footer still present
    await checkSharedElements(page);
  });
}

// ── recent posts on home page link to correct post pages ─────────────────────

test('home page: recent post links navigate to correct news post pages', async ({ page }) => {
  await page.goto('/');
  const recentSection = page.locator('section').filter({ hasText: 'Latest News' });
  const postLinks = recentSection.locator('article a').filter({ hasText: 'Read More' });
  const hrefs = await postLinks.evaluateAll(links => links.map(a => a.getAttribute('href')));

  // Each href points to a valid /news/*.html page
  for (const href of hrefs) {
    expect(href).toMatch(/^\/news\/.+\.html$/);
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
