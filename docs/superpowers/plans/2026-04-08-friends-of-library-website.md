# Friends of the Library Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-page static website for Friends of the Anoka County Library — a nonprofit that supports its local public library through advocacy, fundraising, and community programming.

**Architecture:** Plain HTML/CSS/JS with a Node.js build script that runs on Netlify CI to transform Decap CMS Markdown files (blog posts, volunteer opportunities) into HTML. Static pages are authored directly as HTML; only the three dynamic sections (home recent posts, blog index, volunteer list) are generated at build time by injecting into `<!-- BUILD:* -->` comment markers.

**Tech Stack:** HTML5, CSS3, Vanilla JS (ES6+), Node.js build script, gray-matter, marked, Decap CMS, Netlify (hosting + identity), Google Calendar embed.

---

## File Structure

```
/
├── netlify.toml                  # Build command + security headers (two header blocks: site + /admin)
├── package.json                  # Dev deps: gray-matter, marked
├── style.css                     # All styles — CSS custom properties, reset, nav, footer, pages
├── main.js                       # Hamburger nav toggle + active page link highlighting
├── index.html                    # Home: hero, mission, recent posts marker, CTA
├── about.html                    # About: history, board, contact details
├── events.html                   # Events: Google Calendar iframe embed
├── membership.html               # Membership: tiers, benefits, mailto CTA
├── volunteer.html                # Volunteer: rendered from /_volunteers/*.md at build time
├── donate.html                   # Donate: impact statement + external link button
├── blog/
│   ├── index.html                # Blog list: rendered from /blog/*.md at build time
│   └── *.html                    # Individual post pages: generated from *.md at build time
├── blog/*.md                     # Blog post source files (managed by Decap CMS)
├── _volunteers/
│   └── *.md                      # Volunteer opportunity source files (managed by Decap CMS)
├── admin/
│   ├── index.html                # Decap CMS entry point (loads from CDN)
│   └── config.yml                # CMS collection definitions: blog + volunteers
├── scripts/
│   ├── parse-markdown.js         # Pure functions: parseFrontMatter, mdToHtml, sortByDate
│   ├── parse-markdown.test.js    # Node built-in test runner unit tests
│   └── build.js                  # Orchestrator: reads MD files, writes HTML output
└── images/
    └── logo.svg                  # Placeholder; replaced by client-supplied asset
```

---

## Phase 1 — Foundation

### Task 1: netlify.toml

**Files:**
- Create: `netlify.toml`

- [ ] **Step 1: Write netlify.toml**

```toml
[build]
  command = "npm ci && npm run build"
  publish = "."

# Security headers for all public pages
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "no-referrer"
    Content-Security-Policy = "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; frame-src https://calendar.google.com; img-src 'self' data:; script-src 'self'"

# Relaxed CSP for the CMS admin UI (Decap loads from CDN, needs eval for its editor)
[[headers]]
  for = "/admin/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "no-referrer"
    Content-Security-Policy = "default-src 'self'; script-src 'self' https://unpkg.com https://identity.netlify.com 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://api.netlify.com https://identity.netlify.com https://github.com https://netlify.com https://api.github.com"
```

- [ ] **Step 2: Commit**

```bash
git add netlify.toml
git commit -m "chore: add netlify config with security headers"
```

---

### Task 2: package.json

**Files:**
- Create: `package.json`

- [ ] **Step 1: Write package.json**

```json
{
  "name": "anoka-library-friends",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "node scripts/build.js",
    "test": "node --test scripts/parse-markdown.test.js"
  },
  "devDependencies": {
    "gray-matter": "^4.0.3",
    "marked": "^12.0.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, `package-lock.json` written.

- [ ] **Step 3: Add node_modules to .gitignore**

```bash
echo "node_modules/" > .gitignore
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: add build deps (gray-matter, marked)"
```

---

### Task 3: style.css — Design tokens, reset, and typography

**Files:**
- Create: `style.css`

- [ ] **Step 1: Write style.css (tokens through typography)**

```css
/* =============================================
   DESIGN TOKENS
   Replace --color-primary, --color-accent, and
   font-family values once brand assets are provided.
   ============================================= */
:root {
  /* Colors — placeholders until brand guide delivered */
  --color-primary:      #1a5276;  /* Deep blue */
  --color-primary-dark: #154360;
  --color-accent:       #c0392b;  /* Red — Donate button */
  --color-accent-dark:  #a93226;
  --color-bg:           #ffffff;
  --color-bg-alt:       #f4f6f7;
  --color-text:         #1c1c1c;
  --color-text-muted:   #555555;
  --color-border:       #dde0e3;
  --color-focus:        #f39c12;  /* High-contrast focus ring */

  /* Typography — update font names once brand delivered */
  --font-heading: 'Georgia', 'Times New Roman', serif;
  --font-body:    'Open Sans', Arial, Helvetica, sans-serif;
  --font-size-sm:  0.875rem;
  --font-size-md:  1rem;
  --font-size-lg:  1.25rem;
  --font-size-xl:  1.75rem;
  --font-size-2xl: 2.5rem;
  --line-height:   1.65;

  /* Spacing */
  --space-xs:  0.25rem;
  --space-sm:  0.5rem;
  --space-md:  1rem;
  --space-lg:  2rem;
  --space-xl:  4rem;

  /* Layout */
  --max-width:      1100px;
  --nav-height:     64px;
  --radius:         4px;
  --radius-lg:      8px;
}

/* =============================================
   RESET
   ============================================= */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  font-size: 16px;
}

body {
  font-family: var(--font-body);
  font-size: var(--font-size-md);
  line-height: var(--line-height);
  color: var(--color-text);
  background: var(--color-bg);
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  color: var(--color-primary);
}

a:hover {
  color: var(--color-primary-dark);
}

/* Visible focus ring for keyboard users */
:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

ul[role="list"],
ol[role="list"] {
  list-style: none;
}

/* =============================================
   TYPOGRAPHY
   ============================================= */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  line-height: 1.2;
  color: var(--color-primary-dark);
}

h1 { font-size: var(--font-size-2xl); }
h2 { font-size: var(--font-size-xl); margin-bottom: var(--space-md); }
h3 { font-size: var(--font-size-lg); margin-bottom: var(--space-sm); }

p { margin-bottom: var(--space-md); }
p:last-child { margin-bottom: 0; }

/* =============================================
   LAYOUT UTILITIES
   ============================================= */
.container {
  max-width: var(--max-width);
  margin-inline: auto;
  padding-inline: var(--space-lg);
}

.section {
  padding-block: var(--space-xl);
}

.section--alt {
  background: var(--color-bg-alt);
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
}

@media (max-width: 900px) {
  .grid-3 { grid-template-columns: 1fr; }
}

/* =============================================
   BUTTONS
   ============================================= */
.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  font-family: var(--font-body);
  font-size: var(--font-size-md);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: 2px solid transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.btn--primary {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.btn--primary:hover,
.btn--primary:focus-visible {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  color: #fff;
}

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

.btn--outline {
  background: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.btn--outline:hover,
.btn--outline:focus-visible {
  background: var(--color-primary);
  color: #fff;
}
```

- [ ] **Step 2: Commit**

```bash
git add style.css
git commit -m "style: add design tokens, reset, typography, and button utilities"
```

---

### Task 4: style.css — Navigation, footer, cards, page components

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Append nav + skip link styles to style.css**

```css
/* =============================================
   SKIP TO MAIN (accessibility)
   ============================================= */
.skip-link {
  position: absolute;
  top: -100%;
  left: var(--space-md);
  background: var(--color-primary);
  color: #fff;
  padding: var(--space-sm) var(--space-md);
  border-radius: 0 0 var(--radius) var(--radius);
  font-weight: 600;
  z-index: 9999;
  text-decoration: none;
  transition: top 0.1s;
}

.skip-link:focus {
  top: 0;
}

/* =============================================
   NAVIGATION
   ============================================= */
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

.site-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: var(--max-width);
  margin-inline: auto;
  padding-inline: var(--space-lg);
}

.nav-logo img {
  height: 40px;
  width: auto;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  list-style: none;
}

.nav-links a {
  font-weight: 600;
  text-decoration: none;
  color: var(--color-text);
  padding: var(--space-xs) var(--space-sm);
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

/* Hamburger toggle — hidden on desktop */
.nav-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-sm);
  border-radius: var(--radius);
}

.hamburger-bar {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--color-text);
  border-radius: 2px;
  transition: transform 0.2s, opacity 0.2s;
}

/* Hamburger open state */
.nav-toggle[aria-expanded="true"] .hamburger-bar:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.nav-toggle[aria-expanded="true"] .hamburger-bar:nth-child(2) {
  opacity: 0;
}

.nav-toggle[aria-expanded="true"] .hamburger-bar:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

@media (max-width: 767px) {
  .nav-toggle { display: flex; }

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

  .nav-links.is-open {
    display: flex;
  }

  .nav-links a {
    width: 100%;
    padding: var(--space-sm) 0;
    border-bottom: 1px solid var(--color-border);
  }
}

/* =============================================
   FOOTER
   ============================================= */
.site-footer {
  background: var(--color-primary-dark);
  color: rgba(255, 255, 255, 0.85);
  padding-block: var(--space-xl);
}

.site-footer a {
  color: rgba(255, 255, 255, 0.85);
}

.site-footer a:hover {
  color: #fff;
}

.footer-inner {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-lg);
  max-width: var(--max-width);
  margin-inline: auto;
  padding-inline: var(--space-lg);
}

.footer-copyright {
  max-width: var(--max-width);
  margin-inline: auto;
  padding-inline: var(--space-lg);
  padding-top: var(--space-lg);
  margin-top: var(--space-lg);
  border-top: 1px solid rgba(255,255,255,0.2);
  font-size: var(--font-size-sm);
}

.footer-nav {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.social-links {
  display: flex;
  gap: var(--space-md);
  list-style: none;
}

@media (max-width: 767px) {
  .footer-inner {
    grid-template-columns: 1fr;
  }
}

/* =============================================
   CARDS (blog posts, volunteer opportunities)
   ============================================= */
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

/* =============================================
   MEMBERSHIP TIERS
   ============================================= */
.tier-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-lg);
}

.tier {
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  text-align: center;
}

.tier--featured {
  border-color: var(--color-primary);
}

.tier__price {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-primary);
  margin-block: var(--space-sm);
}

.tier__benefits {
  list-style: none;
  margin-bottom: var(--space-lg);
  text-align: left;
}

.tier__benefits li::before {
  content: "✓ ";
  color: var(--color-primary);
  font-weight: 700;
}

/* =============================================
   BLOG
   ============================================= */
.blog-post__header {
  margin-bottom: var(--space-lg);
}

.blog-post__meta {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.blog-post__body {
  max-width: 720px;
}

.blog-post__body h2 { margin-top: var(--space-lg); }
.blog-post__body h3 { margin-top: var(--space-md); }
.blog-post__body ul,
.blog-post__body ol {
  margin-left: var(--space-lg);
  margin-bottom: var(--space-md);
}

.pagination {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
  padding-top: var(--space-lg);
}

.pagination a,
.pagination span {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  text-decoration: none;
}

.pagination .current {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

/* =============================================
   GOOGLE CALENDAR EMBED
   ============================================= */
.calendar-wrapper {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  aspect-ratio: 4 / 3;
}

.calendar-wrapper iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* =============================================
   VOLUNTEER OPPORTUNITIES
   ============================================= */
.volunteer-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-lg);
  margin-bottom: var(--space-md);
}

.volunteer-card__meta {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-xs);
}

.volunteer-card__cta {
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .volunteer-card {
    flex-direction: column;
  }
}

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

- [ ] **Step 2: Commit**

```bash
git add style.css
git commit -m "style: add nav, footer, cards, hero, membership, blog, volunteer, donate styles"
```

---

### Task 5: main.js — Hamburger nav + active page link

**Files:**
- Create: `main.js`

- [ ] **Step 1: Write main.js**

```javascript
// main.js — shared navigation behavior
// Runs on every page via defer attribute on <script> tag.

(function () {
  'use strict';

  // ── Hamburger menu toggle ────────────────────────────────────────────────
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.querySelector('.nav-links');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      const isOpen = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!isOpen));
      menu.classList.toggle('is-open', !isOpen);
    });

    // Close menu when a nav link is clicked (mobile UX)
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
        toggle.focus();
      }
    });
  }

  // ── Active nav link highlighting ─────────────────────────────────────────
  // Match the current page URL against nav link hrefs.
  // Uses aria-current="page" (read by screen readers) + CSS targets that attr.
  const currentPath = window.location.pathname;

  document.querySelectorAll('.nav-links a').forEach(function (link) {
    const linkPath = new URL(link.href, window.location.origin).pathname;

    // Exact match, or blog sub-pages matching /blog/
    const isActive =
      linkPath === currentPath ||
      (linkPath === '/blog/' && currentPath.startsWith('/blog/'));

    if (isActive) {
      link.setAttribute('aria-current', 'page');
    }
  });
}());
```

- [ ] **Step 2: Commit**

```bash
git add main.js
git commit -m "feat: add hamburger nav toggle and active page highlighting"
```

---

## Phase 2 — Static HTML Pages

> **Nav and footer HTML below are repeated verbatim across all pages.** There is no templating engine; copy-paste exactly, then update the `<title>` tag, `<main>` content, and any page-specific `<meta>` tags for each page.

---

### Task 6: index.html — Home page

**Files:**
- Create: `index.html`

- [ ] **Step 1: Write index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Friends of the Anoka County Library</title>
  <meta name="description" content="Supporting the Anoka County Library through advocacy, fundraising, and community programming.">
  <link rel="stylesheet" href="/style.css">
  <!-- Google Fonts: update family names once brand is confirmed -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>

  <!-- Skip to main content (screen readers + keyboard) -->
  <a class="skip-link" href="#main-content">Skip to main content</a>

  <header class="site-header">
    <nav class="site-nav" aria-label="Main navigation">
      <a href="/" class="nav-logo" aria-label="Friends of the Anoka County Library — home">
        <img src="/images/logo.svg" alt="" width="150" height="40" aria-hidden="true">
      </a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Open menu">
        <span class="hamburger-bar" aria-hidden="true"></span>
        <span class="hamburger-bar" aria-hidden="true"></span>
        <span class="hamburger-bar" aria-hidden="true"></span>
      </button>
      <ul id="nav-menu" class="nav-links" role="list">
        <li><a href="/">Home</a></li>
        <li><a href="/about.html">About &amp; Contact</a></li>
        <li><a href="/events.html">Events</a></li>
        <li><a href="/membership.html">Membership</a></li>
        <li><a href="/volunteer.html">Volunteer</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/donate.html" class="nav-donate">Donate</a></li>
      </ul>
    </nav>
  </header>

  <main id="main-content">

    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <h1>Supporting Our Library, Strengthening Our Community</h1>
        <p><!-- CONTENT: mission statement — supplied by organization --></p>
        <a href="/membership.html" class="btn btn--primary">Become a Member</a>
      </div>
    </section>

    <!-- Featured Events (placeholder — update after content delivered) -->
    <section class="section">
      <div class="container">
        <h2>Upcoming Events</h2>
        <p>Check our <a href="/events.html">events calendar</a> for upcoming programs, book sales, and community gatherings.</p>
      </div>
    </section>

    <!-- Recent Blog Posts — injected by build script -->
    <section class="section section--alt">
      <div class="container">
        <h2>Latest News</h2>
        <!-- BUILD:RECENT_POSTS_START -->
        <p>No posts yet. Check back soon.</p>
        <!-- BUILD:RECENT_POSTS_END -->
        <p style="margin-top: 1.5rem;"><a href="/blog/" class="btn btn--outline">All Posts</a></p>
      </div>
    </section>

    <!-- CTA -->
    <section class="section">
      <div class="container" style="text-align: center;">
        <h2>Join the Friends Today</h2>
        <p>Your membership directly funds library programs, equipment, and events for our entire community.</p>
        <a href="/membership.html" class="btn btn--primary" style="margin-right: 1rem;">View Membership Tiers</a>
        <a href="/donate.html" class="btn btn--donate">Make a Donation</a>
      </div>
    </section>

  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <div>
        <strong>Friends of the Anoka County Library</strong>
        <p style="margin-top: 0.5rem; font-size: 0.875rem;">
          <!-- CONTENT: address, phone — supplied by organization -->
        </p>
      </div>
      <nav aria-label="Footer navigation">
        <ul class="footer-nav">
          <li><a href="/">Home</a></li>
          <li><a href="/about.html">About &amp; Contact</a></li>
          <li><a href="/events.html">Events</a></li>
          <li><a href="/membership.html">Membership</a></li>
          <li><a href="/volunteer.html">Volunteer</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/donate.html">Donate</a></li>
        </ul>
      </nav>
      <div>
        <strong>Follow Us</strong>
        <ul class="social-links" style="margin-top: 0.5rem;">
          <!-- CONTENT: social links — supplied by organization -->
          <li><a href="#" aria-label="Facebook">Facebook</a></li>
        </ul>
      </div>
    </div>
    <p class="footer-copyright">
      &copy; <span id="footer-year"></span> Friends of the Anoka County Library. All rights reserved.
    </p>
  </footer>

  <script defer src="/main.js"></script>
  <script>document.getElementById('footer-year').textContent = new Date().getFullYear();</script>

</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add home page with hero, events CTA, recent posts marker, join CTA"
```

---

### Task 7: about.html — About page

**Files:**
- Create: `about.html`

- [ ] **Step 1: Write about.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About &amp; Contact — Friends of the Anoka County Library</title>
  <meta name="description" content="Learn about the Friends of the Anoka County Library — our history, board members, and how to reach us.">
  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>

  <a class="skip-link" href="#main-content">Skip to main content</a>

  <header class="site-header">
    <nav class="site-nav" aria-label="Main navigation">
      <a href="/" class="nav-logo" aria-label="Friends of the Anoka County Library — home">
        <img src="/images/logo.svg" alt="" width="150" height="40" aria-hidden="true">
      </a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Open menu">
        <span class="hamburger-bar" aria-hidden="true"></span>
        <span class="hamburger-bar" aria-hidden="true"></span>
        <span class="hamburger-bar" aria-hidden="true"></span>
      </button>
      <ul id="nav-menu" class="nav-links" role="list">
        <li><a href="/">Home</a></li>
        <li><a href="/about.html">About &amp; Contact</a></li>
        <li><a href="/events.html">Events</a></li>
        <li><a href="/membership.html">Membership</a></li>
        <li><a href="/volunteer.html">Volunteer</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/donate.html" class="nav-donate">Donate</a></li>
      </ul>
    </nav>
  </header>

  <main id="main-content">

    <section class="section">
      <div class="container">
        <h1>About Us</h1>

        <h2>Our History</h2>
        <p><!-- CONTENT: organization history — supplied by organization --></p>

        <h2 style="margin-top: 2rem;">Board Members</h2>
        <!-- CONTENT: board member names and bios — supplied by organization -->
        <ul>
          <li><!-- Board member name and title --></li>
        </ul>

        <h2 style="margin-top: 2rem;">Partners</h2>
        <p><!-- CONTENT: partner organizations — supplied by organization --></p>
      </div>
    </section>

    <!-- Contact section at bottom per spec -->
    <section class="section section--alt" id="contact">
      <div class="container">
        <h2>Contact Us</h2>
        <p>We'd love to hear from you. Reach out by email or visit us in person.</p>
        <address style="font-style: normal; line-height: 2;">
          <!-- CONTENT: address — supplied by organization --><br>
          Phone: <a href="tel:+10000000000"><!-- CONTENT: phone number --></a><br>
          Email: <a href="mailto:info@example.org"><!-- CONTENT: email address --></a>
        </address>
      </div>
    </section>

  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <div>
        <strong>Friends of the Anoka County Library</strong>
        <p style="margin-top: 0.5rem; font-size: 0.875rem;">
          <!-- CONTENT: address — supplied by organization -->
        </p>
      </div>
      <nav aria-label="Footer navigation">
        <ul class="footer-nav">
          <li><a href="/">Home</a></li>
          <li><a href="/about.html">About &amp; Contact</a></li>
          <li><a href="/events.html">Events</a></li>
          <li><a href="/membership.html">Membership</a></li>
          <li><a href="/volunteer.html">Volunteer</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/donate.html">Donate</a></li>
        </ul>
      </nav>
      <div>
        <strong>Follow Us</strong>
        <ul class="social-links" style="margin-top: 0.5rem;">
          <li><a href="#" aria-label="Facebook">Facebook</a></li>
        </ul>
      </div>
    </div>
    <p class="footer-copyright">
      &copy; <span id="footer-year"></span> Friends of the Anoka County Library. All rights reserved.
    </p>
  </footer>

  <script defer src="/main.js"></script>
  <script>document.getElementById('footer-year').textContent = new Date().getFullYear();</script>

</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add about.html
git commit -m "feat: add About page"
```

---

### Task 8: events.html, membership.html, donate.html

**Files:**
- Create: `events.html`
- Create: `membership.html`
- Create: `donate.html`

> These three pages share the same nav/footer shell as index.html and about.html. Only the `<main>` contents differ. The full nav/footer HTML is identical — copy from about.html and update `<title>` and `<meta name="description">`.

- [ ] **Step 1: Write events.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Events — Friends of the Anoka County Library</title>
  <meta name="description" content="Browse upcoming and past events for the Friends of the Anoka County Library.">
  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>

  <a class="skip-link" href="#main-content">Skip to main content</a>

  <!-- [nav — copy from about.html verbatim] -->
  <header class="site-header">
    <nav class="site-nav" aria-label="Main navigation">
      <a href="/" class="nav-logo" aria-label="Friends of the Anoka County Library — home">
        <img src="/images/logo.svg" alt="" width="150" height="40" aria-hidden="true">
      </a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Open menu">
        <span class="hamburger-bar" aria-hidden="true"></span>
        <span class="hamburger-bar" aria-hidden="true"></span>
        <span class="hamburger-bar" aria-hidden="true"></span>
      </button>
      <ul id="nav-menu" class="nav-links" role="list">
        <li><a href="/">Home</a></li>
        <li><a href="/about.html">About &amp; Contact</a></li>
        <li><a href="/events.html">Events</a></li>
        <li><a href="/membership.html">Membership</a></li>
        <li><a href="/volunteer.html">Volunteer</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/donate.html" class="nav-donate">Donate</a></li>
      </ul>
    </nav>
  </header>

  <main id="main-content">
    <section class="section">
      <div class="container">
        <h1>Events</h1>
        <p>All events are managed through our Google Calendar. Add, edit, or cancel events directly in Google Calendar — changes appear on this page immediately.</p>

        <!--
          SETUP: Replace the src below with the embed URL from your Google Calendar.
          In Google Calendar: Settings (gear icon) → Settings for my calendars
          → [calendar name] → Integrate calendar → Copy "Embed code" iframe src.
          The calendar must be set to Public visibility.
        -->
        <div class="calendar-wrapper" style="margin-top: 2rem;" role="region" aria-label="Library events calendar">
          <iframe
            src="https://calendar.google.com/calendar/embed?src=REPLACE_WITH_CALENDAR_ID%40group.calendar.google.com&ctz=America%2FChicago"
            title="Friends of the Anoka County Library Events Calendar"
            loading="lazy"
            allowfullscreen>
          </iframe>
        </div>
      </div>
    </section>
  </main>

  <!-- [footer — copy from about.html verbatim] -->
  <footer class="site-footer">
    <div class="footer-inner">
      <div><strong>Friends of the Anoka County Library</strong></div>
      <nav aria-label="Footer navigation">
        <ul class="footer-nav">
          <li><a href="/">Home</a></li>
          <li><a href="/about.html">About &amp; Contact</a></li>
          <li><a href="/events.html">Events</a></li>
          <li><a href="/membership.html">Membership</a></li>
          <li><a href="/volunteer.html">Volunteer</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/donate.html">Donate</a></li>
        </ul>
      </nav>
      <div>
        <ul class="social-links">
          <li><a href="#" aria-label="Facebook">Facebook</a></li>
        </ul>
      </div>
    </div>
    <p class="footer-copyright">
      &copy; <span id="footer-year"></span> Friends of the Anoka County Library. All rights reserved.
    </p>
  </footer>

  <script defer src="/main.js"></script>
  <script>document.getElementById('footer-year').textContent = new Date().getFullYear();</script>
</body>
</html>
```

- [ ] **Step 2: Write membership.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Membership — Friends of the Anoka County Library</title>
  <meta name="description" content="Join the Friends of the Anoka County Library. View membership tiers and benefits.">
  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>

  <a class="skip-link" href="#main-content">Skip to main content</a>

  <header class="site-header">
    <nav class="site-nav" aria-label="Main navigation">
      <a href="/" class="nav-logo" aria-label="Friends of the Anoka County Library — home">
        <img src="/images/logo.svg" alt="" width="150" height="40" aria-hidden="true">
      </a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Open menu">
        <span class="hamburger-bar" aria-hidden="true"></span>
        <span class="hamburger-bar" aria-hidden="true"></span>
        <span class="hamburger-bar" aria-hidden="true"></span>
      </button>
      <ul id="nav-menu" class="nav-links" role="list">
        <li><a href="/">Home</a></li>
        <li><a href="/about.html">About &amp; Contact</a></li>
        <li><a href="/events.html">Events</a></li>
        <li><a href="/membership.html">Membership</a></li>
        <li><a href="/volunteer.html">Volunteer</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/donate.html" class="nav-donate">Donate</a></li>
      </ul>
    </nav>
  </header>

  <main id="main-content">

    <section class="section">
      <div class="container">
        <h1>Membership</h1>
        <p>Your membership directly supports library programs, events, and equipment for the entire community. Join today — all memberships are renewed annually.</p>
        <p>To join, send an email to <a href="mailto:membership@example.org?subject=New%20Membership"><!-- CONTENT: membership email --></a> with your name, address, and chosen tier. We'll send you a confirmation and invoice.</p>
      </div>
    </section>

    <section class="section section--alt">
      <div class="container">
        <h2>Membership Tiers</h2>
        <!--
          CONTENT: tier names, prices, and benefits supplied by organization.
          Duplicate or remove .tier blocks as needed.
        -->
        <div class="tier-list">

          <div class="tier">
            <h3>Individual</h3>
            <p class="tier__price">$10 / year</p>
            <ul class="tier__benefits">
              <li><!-- CONTENT: benefit 1 --></li>
              <li><!-- CONTENT: benefit 2 --></li>
              <li>Access to members-only events</li>
            </ul>
            <a href="mailto:membership@example.org?subject=Individual%20Membership" class="btn btn--outline">Join — $10</a>
          </div>

          <div class="tier tier--featured">
            <h3>Family</h3>
            <p class="tier__price">$25 / year</p>
            <ul class="tier__benefits">
              <li>Everything in Individual</li>
              <li><!-- CONTENT: family benefit --></li>
            </ul>
            <a href="mailto:membership@example.org?subject=Family%20Membership" class="btn btn--primary">Join — $25</a>
          </div>

          <div class="tier">
            <h3>Sustaining</h3>
            <p class="tier__price">$100 / year</p>
            <ul class="tier__benefits">
              <li>Everything in Family</li>
              <li>Recognition in annual report</li>
              <li><!-- CONTENT: sustaining benefit --></li>
            </ul>
            <a href="mailto:membership@example.org?subject=Sustaining%20Membership" class="btn btn--outline">Join — $100</a>
          </div>

        </div>
      </div>
    </section>

  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <div><strong>Friends of the Anoka County Library</strong></div>
      <nav aria-label="Footer navigation">
        <ul class="footer-nav">
          <li><a href="/">Home</a></li>
          <li><a href="/about.html">About &amp; Contact</a></li>
          <li><a href="/events.html">Events</a></li>
          <li><a href="/membership.html">Membership</a></li>
          <li><a href="/volunteer.html">Volunteer</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/donate.html">Donate</a></li>
        </ul>
      </nav>
      <div>
        <ul class="social-links">
          <li><a href="#" aria-label="Facebook">Facebook</a></li>
        </ul>
      </div>
    </div>
    <p class="footer-copyright">
      &copy; <span id="footer-year"></span> Friends of the Anoka County Library. All rights reserved.
    </p>
  </footer>

  <script defer src="/main.js"></script>
  <script>document.getElementById('footer-year').textContent = new Date().getFullYear();</script>
</body>
</html>
```

- [ ] **Step 3: Write donate.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donate — Friends of the Anoka County Library</title>
  <meta name="description" content="Support the Friends of the Anoka County Library with a donation. Your gift funds programs and events for the whole community.">
  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>

  <a class="skip-link" href="#main-content">Skip to main content</a>

  <header class="site-header">
    <nav class="site-nav" aria-label="Main navigation">
      <a href="/" class="nav-logo" aria-label="Friends of the Anoka County Library — home">
        <img src="/images/logo.svg" alt="" width="150" height="40" aria-hidden="true">
      </a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Open menu">
        <span class="hamburger-bar" aria-hidden="true"></span>
        <span class="hamburger-bar" aria-hidden="true"></span>
        <span class="hamburger-bar" aria-hidden="true"></span>
      </button>
      <ul id="nav-menu" class="nav-links" role="list">
        <li><a href="/">Home</a></li>
        <li><a href="/about.html">About &amp; Contact</a></li>
        <li><a href="/events.html">Events</a></li>
        <li><a href="/membership.html">Membership</a></li>
        <li><a href="/volunteer.html">Volunteer</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/donate.html" class="nav-donate">Donate</a></li>
      </ul>
    </nav>
  </header>

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

  <footer class="site-footer">
    <div class="footer-inner">
      <div><strong>Friends of the Anoka County Library</strong></div>
      <nav aria-label="Footer navigation">
        <ul class="footer-nav">
          <li><a href="/">Home</a></li>
          <li><a href="/about.html">About &amp; Contact</a></li>
          <li><a href="/events.html">Events</a></li>
          <li><a href="/membership.html">Membership</a></li>
          <li><a href="/volunteer.html">Volunteer</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/donate.html">Donate</a></li>
        </ul>
      </nav>
      <div>
        <ul class="social-links">
          <li><a href="#" aria-label="Facebook">Facebook</a></li>
        </ul>
      </div>
    </div>
    <p class="footer-copyright">
      &copy; <span id="footer-year"></span> Friends of the Anoka County Library. All rights reserved.
    </p>
  </footer>

  <script defer src="/main.js"></script>
  <script>document.getElementById('footer-year').textContent = new Date().getFullYear();</script>
</body>
</html>
```

- [ ] **Step 4: Commit**

```bash
git add events.html membership.html donate.html
git commit -m "feat: add events, membership, and donate pages"
```

---

### Task 9: volunteer.html and blog/index.html — Template pages with build markers

**Files:**
- Create: `volunteer.html`
- Create: `blog/index.html`

- [ ] **Step 1: Write volunteer.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Volunteer — Friends of the Anoka County Library</title>
  <meta name="description" content="Volunteer opportunities with the Friends of the Anoka County Library.">
  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>

  <a class="skip-link" href="#main-content">Skip to main content</a>

  <header class="site-header">
    <nav class="site-nav" aria-label="Main navigation">
      <a href="/" class="nav-logo" aria-label="Friends of the Anoka County Library — home">
        <img src="/images/logo.svg" alt="" width="150" height="40" aria-hidden="true">
      </a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Open menu">
        <span class="hamburger-bar" aria-hidden="true"></span>
        <span class="hamburger-bar" aria-hidden="true"></span>
        <span class="hamburger-bar" aria-hidden="true"></span>
      </button>
      <ul id="nav-menu" class="nav-links" role="list">
        <li><a href="/">Home</a></li>
        <li><a href="/about.html">About &amp; Contact</a></li>
        <li><a href="/events.html">Events</a></li>
        <li><a href="/membership.html">Membership</a></li>
        <li><a href="/volunteer.html">Volunteer</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/donate.html" class="nav-donate">Donate</a></li>
      </ul>
    </nav>
  </header>

  <main id="main-content">
    <section class="section">
      <div class="container">
        <h1>Volunteer Opportunities</h1>
        <p>Volunteers are the backbone of the Friends of the Library. Browse current openings below and click <strong>Sign Up</strong> to register through our sign-up form.</p>

        <div style="margin-top: 2rem;">
          <!-- BUILD:VOLUNTEER_OPPORTUNITIES_START -->
          <p>No volunteer opportunities are currently listed. Check back soon!</p>
          <!-- BUILD:VOLUNTEER_OPPORTUNITIES_END -->
        </div>

        <!-- BUILD:PAST_OPPORTUNITIES_START -->
        <!-- Past opportunities injected here when present -->
        <!-- BUILD:PAST_OPPORTUNITIES_END -->

      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <div><strong>Friends of the Anoka County Library</strong></div>
      <nav aria-label="Footer navigation">
        <ul class="footer-nav">
          <li><a href="/">Home</a></li>
          <li><a href="/about.html">About &amp; Contact</a></li>
          <li><a href="/events.html">Events</a></li>
          <li><a href="/membership.html">Membership</a></li>
          <li><a href="/volunteer.html">Volunteer</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/donate.html">Donate</a></li>
        </ul>
      </nav>
      <div>
        <ul class="social-links">
          <li><a href="#" aria-label="Facebook">Facebook</a></li>
        </ul>
      </div>
    </div>
    <p class="footer-copyright">
      &copy; <span id="footer-year"></span> Friends of the Anoka County Library. All rights reserved.
    </p>
  </footer>

  <script defer src="/main.js"></script>
  <script>document.getElementById('footer-year').textContent = new Date().getFullYear();</script>
</body>
</html>
```

- [ ] **Step 2: Create blog/ directory and write blog/index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog — Friends of the Anoka County Library</title>
  <meta name="description" content="News and updates from the Friends of the Anoka County Library.">
  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>

  <a class="skip-link" href="#main-content">Skip to main content</a>

  <header class="site-header">
    <nav class="site-nav" aria-label="Main navigation">
      <a href="/" class="nav-logo" aria-label="Friends of the Anoka County Library — home">
        <img src="/images/logo.svg" alt="" width="150" height="40" aria-hidden="true">
      </a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Open menu">
        <span class="hamburger-bar" aria-hidden="true"></span>
        <span class="hamburger-bar" aria-hidden="true"></span>
        <span class="hamburger-bar" aria-hidden="true"></span>
      </button>
      <ul id="nav-menu" class="nav-links" role="list">
        <li><a href="/">Home</a></li>
        <li><a href="/about.html">About &amp; Contact</a></li>
        <li><a href="/events.html">Events</a></li>
        <li><a href="/membership.html">Membership</a></li>
        <li><a href="/volunteer.html">Volunteer</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/donate.html" class="nav-donate">Donate</a></li>
      </ul>
    </nav>
  </header>

  <main id="main-content">
    <section class="section">
      <div class="container">
        <h1>Blog</h1>

        <!-- BUILD:BLOG_INDEX_START -->
        <p>No posts yet. Check back soon!</p>
        <!-- BUILD:BLOG_INDEX_END -->

        <!-- BUILD:BLOG_PAGINATION_START -->
        <!-- BUILD:BLOG_PAGINATION_END -->
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <div><strong>Friends of the Anoka County Library</strong></div>
      <nav aria-label="Footer navigation">
        <ul class="footer-nav">
          <li><a href="/">Home</a></li>
          <li><a href="/about.html">About &amp; Contact</a></li>
          <li><a href="/events.html">Events</a></li>
          <li><a href="/membership.html">Membership</a></li>
          <li><a href="/volunteer.html">Volunteer</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/donate.html">Donate</a></li>
        </ul>
      </nav>
      <div>
        <ul class="social-links">
          <li><a href="#" aria-label="Facebook">Facebook</a></li>
        </ul>
      </div>
    </div>
    <p class="footer-copyright">
      &copy; <span id="footer-year"></span> Friends of the Anoka County Library. All rights reserved.
    </p>
  </footer>

  <script defer src="/main.js"></script>
  <script>document.getElementById('footer-year').textContent = new Date().getFullYear();</script>
</body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add volunteer.html blog/index.html
git commit -m "feat: add volunteer and blog index pages with build injection markers"
```

---

## Phase 3 — Build System

### Task 10: scripts/parse-markdown.js + unit tests

**Files:**
- Create: `scripts/parse-markdown.js`
- Create: `scripts/parse-markdown.test.js`

- [ ] **Step 1: Write scripts/parse-markdown.js**

```javascript
// scripts/parse-markdown.js
// Pure functions for parsing Markdown front matter and converting body to HTML.
// No side effects — all I/O lives in build.js.

import matter from 'gray-matter';
import { marked } from 'marked';

/**
 * Parse a Markdown file string into { data, html, slug }.
 * @param {string} fileContent - Raw file content including YAML front matter.
 * @param {string} filename    - Filename (e.g. "summer-reading-recap.md") used to derive slug.
 * @returns {{ data: object, html: string, slug: string }}
 */
export function parsePost(fileContent, filename) {
  const { data, content } = matter(fileContent);
  const html = marked.parse(content);
  const slug = filename.replace(/\.md$/, '');
  return { data, html, slug };
}

/**
 * Sort an array of parsed posts newest-first by data.date.
 * Items with missing or invalid dates sort to the end.
 * @param {Array<{ data: { date: string|Date } }>} posts
 * @returns {Array}
 */
export function sortByDateDesc(posts) {
  return [...posts].sort((a, b) => {
    const da = a.data.date ? new Date(a.data.date) : new Date(0);
    const db = b.data.date ? new Date(b.data.date) : new Date(0);
    return db - da;
  });
}

/**
 * Sort volunteer opportunities by start_date ascending (soonest first).
 * Items with missing dates sort to the end.
 * @param {Array<{ data: { start_date: string|Date } }>} items
 * @returns {Array}
 */
export function sortByStartDateAsc(items) {
  return [...items].sort((a, b) => {
    const da = a.data.start_date ? new Date(a.data.start_date) : new Date(8640000000000000);
    const db = b.data.start_date ? new Date(b.data.start_date) : new Date(8640000000000000);
    return da - db;
  });
}

/**
 * Format a date value as a human-readable string (e.g. "April 8, 2026").
 * Returns empty string for falsy input.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Return true if the opportunity's end_date is in the past (expired).
 * @param {{ end_date: string|Date }} data
 * @returns {boolean}
 */
export function isExpired(data) {
  if (!data.end_date) return false;
  return new Date(data.end_date) < new Date();
}

/**
 * Paginate an array into chunks of `pageSize`.
 * @param {Array} items
 * @param {number} pageSize
 * @returns {Array<Array>}  Array of pages; each page is an array of items.
 */
export function paginate(items, pageSize) {
  const pages = [];
  for (let i = 0; i < items.length; i += pageSize) {
    pages.push(items.slice(i, i + pageSize));
  }
  return pages;
}
```

- [ ] **Step 2: Write scripts/parse-markdown.test.js**

```javascript
// scripts/parse-markdown.test.js
// Run with: node --test scripts/parse-markdown.test.js

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePost,
  sortByDateDesc,
  sortByStartDateAsc,
  formatDate,
  isExpired,
  paginate,
} from './parse-markdown.js';

// ── parsePost ────────────────────────────────────────────────────────────────

test('parsePost extracts title and author from front matter', () => {
  const content = `---
title: Summer Reading Recap
author: Jane Doe
date: 2026-08-01
excerpt: A great summer at the library.
---
Hello **world**.`;
  const { data, html, slug } = parsePost(content, 'summer-reading-recap.md');
  assert.equal(data.title, 'Summer Reading Recap');
  assert.equal(data.author, 'Jane Doe');
  assert.equal(slug, 'summer-reading-recap');
  assert.ok(html.includes('<strong>world</strong>'), `Expected bold markdown in html, got: ${html}`);
});

test('parsePost derives slug from filename by stripping .md', () => {
  const content = '---\ntitle: Test\n---\nBody.';
  const { slug } = parsePost(content, 'my-cool-post.md');
  assert.equal(slug, 'my-cool-post');
});

test('parsePost handles post with no front matter without throwing', () => {
  const content = 'Just a plain body with no front matter.';
  const { data, html, slug } = parsePost(content, 'plain.md');
  assert.deepEqual(data, {});
  assert.ok(html.includes('Just a plain body'));
  assert.equal(slug, 'plain');
});

// ── sortByDateDesc ────────────────────────────────────────────────────────────

test('sortByDateDesc returns newest post first', () => {
  const posts = [
    { data: { date: '2026-01-01' } },
    { data: { date: '2026-06-15' } },
    { data: { date: '2025-12-31' } },
  ];
  const sorted = sortByDateDesc(posts);
  assert.equal(sorted[0].data.date, '2026-06-15');
  assert.equal(sorted[2].data.date, '2025-12-31');
});

test('sortByDateDesc puts posts with missing date at end', () => {
  const posts = [
    { data: { date: '2026-03-01' } },
    { data: {} },
  ];
  const sorted = sortByDateDesc(posts);
  assert.equal(sorted[0].data.date, '2026-03-01');
  assert.equal(sorted[1].data.date, undefined);
});

// ── sortByStartDateAsc ────────────────────────────────────────────────────────

test('sortByStartDateAsc returns soonest opportunity first', () => {
  const items = [
    { data: { start_date: '2026-09-01' } },
    { data: { start_date: '2026-05-10' } },
  ];
  const sorted = sortByStartDateAsc(items);
  assert.equal(sorted[0].data.start_date, '2026-05-10');
});

// ── formatDate ────────────────────────────────────────────────────────────────

test('formatDate formats ISO date as readable string', () => {
  const result = formatDate('2026-04-08');
  assert.equal(result, 'April 8, 2026');
});

test('formatDate returns empty string for falsy input', () => {
  assert.equal(formatDate(null), '');
  assert.equal(formatDate(''), '');
  assert.equal(formatDate(undefined), '');
});

// ── isExpired ─────────────────────────────────────────────────────────────────

test('isExpired returns true for past end_date', () => {
  assert.ok(isExpired({ end_date: '2000-01-01' }));
});

test('isExpired returns false for future end_date', () => {
  assert.ok(!isExpired({ end_date: '2099-01-01' }));
});

test('isExpired returns false when end_date is missing', () => {
  assert.ok(!isExpired({}));
});

// ── paginate ──────────────────────────────────────────────────────────────────

test('paginate splits 11 items into pages of 10 and 1', () => {
  const items = Array.from({ length: 11 }, (_, i) => i);
  const pages = paginate(items, 10);
  assert.equal(pages.length, 2);
  assert.equal(pages[0].length, 10);
  assert.equal(pages[1].length, 1);
});

test('paginate returns one page when items fit', () => {
  const items = [1, 2, 3];
  const pages = paginate(items, 10);
  assert.equal(pages.length, 1);
  assert.deepEqual(pages[0], [1, 2, 3]);
});

test('paginate returns empty array for empty input', () => {
  assert.deepEqual(paginate([], 10), []);
});
```

- [ ] **Step 3: Run tests to verify they fail (functions exist but logic not exercised yet)**

```bash
npm test
```

Expected: All tests PASS (the module is already written — running tests confirms the implementation is correct before build.js uses it).

- [ ] **Step 4: Commit**

```bash
git add scripts/parse-markdown.js scripts/parse-markdown.test.js
git commit -m "feat: add markdown parsing utilities with unit tests"
```

---

### Task 11: scripts/build.js — HTML generation orchestrator

**Files:**
- Create: `scripts/build.js`

- [ ] **Step 1: Write scripts/build.js**

```javascript
// scripts/build.js
// Netlify build orchestrator. Run via: npm run build
// Reads Markdown source files, generates/updates HTML files.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parsePost,
  sortByDateDesc,
  sortByStartDateAsc,
  formatDate,
  isExpired,
  paginate,
} from './parse-markdown.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BLOG_SRC  = join(ROOT, 'blog');
const VOL_SRC   = join(ROOT, '_volunteers');
const POSTS_PER_PAGE = 10;
const RECENT_POSTS_COUNT = 3;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Read and parse all .md files from a directory. Returns [] if dir doesn't exist. */
function readMarkdownDir(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(filename => {
      const raw = readFileSync(join(dir, filename), 'utf8');
      return parsePost(raw, filename);
    });
}

/** Replace content between two HTML comment markers in a file (in-place). */
function injectBetweenMarkers(filePath, startMarker, endMarker, newContent) {
  const src = readFileSync(filePath, 'utf8');
  const startTag = `<!-- ${startMarker} -->`;
  const endTag   = `<!-- ${endMarker} -->`;
  const startIdx = src.indexOf(startTag);
  const endIdx   = src.indexOf(endTag);
  if (startIdx === -1 || endIdx === -1) {
    console.warn(`[build] Markers not found in ${filePath}: ${startMarker}`);
    return;
  }
  const before = src.slice(0, startIdx + startTag.length);
  const after  = src.slice(endIdx);
  writeFileSync(filePath, `${before}\n${newContent}\n${after}`, 'utf8');
}

/** Shared nav HTML included in each generated blog post page. */
function navHtml() {
  return `  <header class="site-header">
    <nav class="site-nav" aria-label="Main navigation">
      <a href="/" class="nav-logo" aria-label="Friends of the Anoka County Library — home">
        <img src="/images/logo.svg" alt="" width="150" height="40" aria-hidden="true">
      </a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Open menu">
        <span class="hamburger-bar" aria-hidden="true"></span>
        <span class="hamburger-bar" aria-hidden="true"></span>
        <span class="hamburger-bar" aria-hidden="true"></span>
      </button>
      <ul id="nav-menu" class="nav-links" role="list">
        <li><a href="/">Home</a></li>
        <li><a href="/about.html">About &amp; Contact</a></li>
        <li><a href="/events.html">Events</a></li>
        <li><a href="/membership.html">Membership</a></li>
        <li><a href="/volunteer.html">Volunteer</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/donate.html" class="nav-donate">Donate</a></li>
      </ul>
    </nav>
  </header>`;
}

/** Shared footer HTML included in each generated blog post page. */
function footerHtml() {
  return `  <footer class="site-footer">
    <div class="footer-inner">
      <div><strong>Friends of the Anoka County Library</strong></div>
      <nav aria-label="Footer navigation">
        <ul class="footer-nav">
          <li><a href="/">Home</a></li>
          <li><a href="/about.html">About &amp; Contact</a></li>
          <li><a href="/events.html">Events</a></li>
          <li><a href="/membership.html">Membership</a></li>
          <li><a href="/volunteer.html">Volunteer</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/donate.html">Donate</a></li>
        </ul>
      </nav>
      <div>
        <ul class="social-links">
          <li><a href="#" aria-label="Facebook">Facebook</a></li>
        </ul>
      </div>
    </div>
    <p class="footer-copyright">
      &copy; <span id="footer-year"></span> Friends of the Anoka County Library. All rights reserved.
    </p>
  </footer>`;
}

// ── Blog post page generation ──────────────────────────────────────────────────

function generateBlogPostPage({ data, html, slug }) {
  const title    = data.title   || 'Untitled Post';
  const author   = data.author  || '';
  const dateStr  = formatDate(data.date);
  const ogImage  = data['og:image'] ? `<meta property="og:image" content="${data['og:image']}">` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Friends of the Anoka County Library</title>
  <meta name="description" content="${(data.excerpt || '').replace(/"/g, '&quot;')}">
  ${ogImage}
  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>

  <a class="skip-link" href="#main-content">Skip to main content</a>

${navHtml()}

  <main id="main-content">
    <article class="section">
      <div class="container">
        <header class="blog-post__header">
          <h1>${title}</h1>
          <p class="blog-post__meta">
            ${dateStr ? `<time datetime="${data.date}">${dateStr}</time>` : ''}
            ${author ? ` &middot; ${author}` : ''}
          </p>
        </header>
        <div class="blog-post__body">
          ${html}
        </div>
        <p style="margin-top: 2rem;">
          <a href="/blog/">&larr; Back to all posts</a>
        </p>
      </div>
    </article>
  </main>

${footerHtml()}

  <script defer src="/main.js"></script>
  <script>document.getElementById('footer-year').textContent = new Date().getFullYear();</script>
</body>
</html>`;
}

// ── Blog index list HTML ───────────────────────────────────────────────────────

function blogIndexListHtml(posts) {
  if (posts.length === 0) return '<p>No posts yet. Check back soon!</p>';
  return posts.map(({ data, slug }) => `
    <article class="card" style="margin-bottom: 1.5rem;">
      <p class="card__date">${formatDate(data.date) || ''}</p>
      <h2 class="card__title"><a href="/blog/${slug}.html">${data.title || 'Untitled'}</a></h2>
      ${data.excerpt ? `<p class="card__excerpt">${data.excerpt}</p>` : ''}
      <a href="/blog/${slug}.html" class="btn btn--outline">Read More</a>
    </article>`).join('\n');
}

function paginationHtml(pages, currentPage) {
  if (pages.length <= 1) return '';
  const links = pages.map((_, i) => {
    const pageNum = i + 1;
    if (pageNum === currentPage) {
      return `<span class="current" aria-current="page">${pageNum}</span>`;
    }
    // For simplicity: page 1 → /blog/, page 2+ → /blog/page-2.html etc.
    const href = pageNum === 1 ? '/blog/' : `/blog/page-${pageNum}.html`;
    return `<a href="${href}">${pageNum}</a>`;
  });
  return `<nav class="pagination" aria-label="Blog pagination">${links.join('')}</nav>`;
}

// ── Recent posts HTML (3 newest) for home page ────────────────────────────────

function recentPostsHtml(posts) {
  const recent = sortByDateDesc(posts).slice(0, RECENT_POSTS_COUNT);
  if (recent.length === 0) return '<p>No posts yet. Check back soon.</p>';
  return `<div class="grid-3">${recent.map(({ data, slug }) => `
    <article class="card">
      <p class="card__date">${formatDate(data.date) || ''}</p>
      <h3 class="card__title"><a href="/blog/${slug}.html">${data.title || 'Untitled'}</a></h3>
      ${data.excerpt ? `<p class="card__excerpt">${data.excerpt}</p>` : ''}
      <a href="/blog/${slug}.html">Read More &rarr;</a>
    </article>`).join('\n')}</div>`;
}

// ── Volunteer opportunity HTML ────────────────────────────────────────────────

function volunteerCardHtml({ data, slug }) {
  const startStr = formatDate(data.start_date);
  const endStr   = formatDate(data.end_date);
  const dateRange = [startStr, endStr].filter(Boolean).join(' – ');
  const location  = data.location ? `<span> &middot; ${data.location}</span>` : '';
  const needed    = data.volunteers_needed ? `<span> &middot; ${data.volunteers_needed} volunteers needed</span>` : '';

  return `
    <div class="volunteer-card">
      <div>
        <p class="volunteer-card__meta">${dateRange}${location}${needed}</p>
        <h2 style="margin-bottom: 0.5rem;">${data.title || 'Untitled Opportunity'}</h2>
        <p>${data.description || ''}</p>
        ${data.contact ? `<p style="font-size:0.875rem; color: var(--color-text-muted);">Contact: ${data.contact}</p>` : ''}
      </div>
      ${data.signup_url ? `
      <div class="volunteer-card__cta">
        <a href="${data.signup_url}" class="btn btn--primary" target="_blank" rel="noopener noreferrer"
           aria-label="Sign up for ${data.title || 'this opportunity'} — opens external sign-up form">
          Sign Up
        </a>
      </div>` : ''}
    </div>`;
}

// ── Main build orchestration ──────────────────────────────────────────────────

function build() {
  console.log('[build] Starting build...');

  // 1. Blog posts
  const allPosts = sortByDateDesc(readMarkdownDir(BLOG_SRC));
  console.log(`[build] Found ${allPosts.length} blog post(s).`);

  // Generate individual blog post HTML files
  allPosts.forEach(post => {
    const outPath = join(BLOG_SRC, `${post.slug}.html`);
    writeFileSync(outPath, generateBlogPostPage(post), 'utf8');
    console.log(`[build]   → ${outPath}`);
  });

  // Generate paginated blog index (page 1 injected into blog/index.html)
  const pages = paginate(allPosts, POSTS_PER_PAGE);
  const page1Posts = pages[0] || [];
  injectBetweenMarkers(
    join(BLOG_SRC, 'index.html'),
    'BUILD:BLOG_INDEX_START',
    'BUILD:BLOG_INDEX_END',
    blogIndexListHtml(page1Posts)
  );
  injectBetweenMarkers(
    join(BLOG_SRC, 'index.html'),
    'BUILD:BLOG_PAGINATION_START',
    'BUILD:BLOG_PAGINATION_END',
    paginationHtml(pages, 1)
  );

  // Generate additional pagination pages (page 2+)
  pages.slice(1).forEach((pagePosts, i) => {
    const pageNum  = i + 2;
    const pageFile = join(BLOG_SRC, `page-${pageNum}.html`);
    // Generate a standalone page using the blog/index.html as a template base
    const indexTemplate = readFileSync(join(BLOG_SRC, 'index.html'), 'utf8');
    // Re-inject for this page number
    let pageHtml = indexTemplate;
    pageHtml = pageHtml.replace(
      /<!-- BUILD:BLOG_INDEX_START -->[\s\S]*?<!-- BUILD:BLOG_INDEX_END -->/,
      `<!-- BUILD:BLOG_INDEX_START -->\n${blogIndexListHtml(pagePosts)}\n<!-- BUILD:BLOG_INDEX_END -->`
    );
    pageHtml = pageHtml.replace(
      /<!-- BUILD:BLOG_PAGINATION_START -->[\s\S]*?<!-- BUILD:BLOG_PAGINATION_END -->/,
      `<!-- BUILD:BLOG_PAGINATION_START -->\n${paginationHtml(pages, pageNum)}\n<!-- BUILD:BLOG_PAGINATION_END -->`
    );
    pageHtml = pageHtml.replace(
      /<title>Blog —/,
      `<title>Blog — Page ${pageNum} —`
    );
    writeFileSync(pageFile, pageHtml, 'utf8');
    console.log(`[build]   → ${pageFile}`);
  });

  // 2. Home page recent posts
  injectBetweenMarkers(
    join(ROOT, 'index.html'),
    'BUILD:RECENT_POSTS_START',
    'BUILD:RECENT_POSTS_END',
    recentPostsHtml(allPosts)
  );
  console.log('[build] Injected recent posts into index.html');

  // 3. Volunteer opportunities
  const allOpps = sortByStartDateAsc(readMarkdownDir(VOL_SRC));
  console.log(`[build] Found ${allOpps.length} volunteer opportunity(ies).`);

  const currentOpps = allOpps.filter(o => !isExpired(o.data));
  const pastOpps    = allOpps.filter(o => isExpired(o.data));

  const currentHtml = currentOpps.length > 0
    ? currentOpps.map(volunteerCardHtml).join('\n')
    : '<p>No volunteer opportunities are currently listed. Check back soon!</p>';

  injectBetweenMarkers(
    join(ROOT, 'volunteer.html'),
    'BUILD:VOLUNTEER_OPPORTUNITIES_START',
    'BUILD:VOLUNTEER_OPPORTUNITIES_END',
    currentHtml
  );

  const pastHtml = pastOpps.length > 0
    ? `<details style="margin-top: 2rem;">
        <summary style="cursor:pointer; font-weight:600;">Past Opportunities (${pastOpps.length})</summary>
        <div style="margin-top: 1rem; opacity: 0.75;">
          ${pastOpps.map(volunteerCardHtml).join('\n')}
        </div>
      </details>`
    : '';

  injectBetweenMarkers(
    join(ROOT, 'volunteer.html'),
    'BUILD:PAST_OPPORTUNITIES_START',
    'BUILD:PAST_OPPORTUNITIES_END',
    pastHtml
  );
  console.log('[build] Injected volunteer opportunities into volunteer.html');

  console.log('[build] Done.');
}

build();
```

- [ ] **Step 2: Run the build to verify it works with no Markdown files**

```bash
npm run build
```

Expected output:
```
[build] Starting build...
[build] Found 0 blog post(s).
[build] Injected recent posts into index.html
[build] Found 0 volunteer opportunity(ies).
[build] Done.
```

- [ ] **Step 3: Commit**

```bash
git add scripts/build.js
git commit -m "feat: add Netlify build script for blog posts, blog index, recent posts, and volunteer opportunities"
```

---

### Task 12: Sample content files and test the full build

**Files:**
- Create: `blog/welcome-to-our-new-website.md`
- Create: `blog/summer-reading-program-recap.md`
- Create: `blog/annual-book-sale-2026.md`
- Create: `_volunteers/book-sale-setup.md`

- [ ] **Step 1: Create sample blog posts**

`blog/welcome-to-our-new-website.md`:
```markdown
---
title: Welcome to Our New Website
author: Friends of the Library Board
date: 2026-04-01
excerpt: We're excited to launch our new website — a fresh home for our community news, events, and membership information.
---

We're thrilled to welcome you to the new Friends of the Anoka County Library website!

This site will be your go-to place for:

- Upcoming **events and programs**
- **Membership** information and sign-up
- **Volunteer** opportunities
- News from our board and community

Thank you for your continued support of our local library. We couldn't do this without you.
```

`blog/summer-reading-program-recap.md`:
```markdown
---
title: Summer Reading Program Recap
author: Jane Smith
date: 2025-09-15
excerpt: This summer's reading program was our most successful yet — over 400 kids participated and 12,000 books were logged.
---

What a summer it was!

This year's Summer Reading Program brought in over **400 young readers**, who collectively logged more than **12,000 books**. We hosted 14 events at branches across the county, from storytimes to STEM workshops.

A huge thank you to our volunteers who made this possible, and to the community members who donated to fund the program.

We're already planning next year — stay tuned!
```

`blog/annual-book-sale-2026.md`:
```markdown
---
title: Annual Book Sale — April 2026
author: Friends of the Library Board
date: 2026-03-10
excerpt: Join us April 25–27 for our annual book sale at the Anoka County Library. Thousands of books starting at $1.
---

Mark your calendars! Our Annual Book Sale is coming up **April 25–27, 2026** at the Anoka County Library main branch.

Thousands of gently used books, DVDs, and audiobooks priced from just **$1**. All proceeds support library programming.

**Hours:**
- Saturday April 25: 9 AM – 5 PM (Friends Members Early Access 8–9 AM)
- Sunday April 26: 12 PM – 5 PM
- Monday April 27: 9 AM – 2 PM (Bag Sale — fill a bag for $5)

Volunteers needed for setup on Friday April 24 — see the Volunteer page to sign up.
```

- [ ] **Step 2: Create sample volunteer opportunity**

`_volunteers/book-sale-setup.md`:
```markdown
---
title: Book Sale Setup Crew
start_date: 2026-04-24
end_date: 2026-04-24
description: Help us set up tables, sort donated books, and arrange the sale floor for our Annual Book Sale. No experience needed — just a willingness to help!
signup_url: https://www.signupgenius.com/REPLACE_WITH_ACTUAL_LINK
location: Anoka County Library Main Branch
volunteers_needed: 15
contact: volunteer@example.org
---
```

- [ ] **Step 3: Run the full build**

```bash
npm run build
```

Expected output:
```
[build] Starting build...
[build] Found 3 blog post(s).
[build]   → .../blog/annual-book-sale-2026.html
[build]   → .../blog/welcome-to-our-new-website.html
[build]   → .../blog/summer-reading-program-recap.html
[build] Injected recent posts into index.html
[build] Found 1 volunteer opportunity(ies).
[build] Injected volunteer opportunities into volunteer.html
[build] Done.
```

- [ ] **Step 4: Verify blog post HTML was generated**

```bash
ls blog/*.html
```

Expected: `blog/annual-book-sale-2026.html  blog/index.html  blog/summer-reading-program-recap.html  blog/welcome-to-our-new-website.html`

- [ ] **Step 5: Verify recent posts were injected into index.html**

```bash
grep -A 5 "BUILD:RECENT_POSTS_START" index.html
```

Expected: Three blog post card HTML blocks between the markers.

- [ ] **Step 6: Commit**

```bash
git add blog/*.md _volunteers/ blog/*.html index.html blog/index.html volunteer.html
git commit -m "feat: add sample content and verify full build pipeline"
```

---

## Phase 4 — CMS Setup

### Task 13: admin/index.html and admin/config.yml

**Files:**
- Create: `admin/index.html`
- Create: `admin/config.yml`

- [ ] **Step 1: Create admin directory**

```bash
mkdir admin
```

- [ ] **Step 2: Write admin/index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Content Manager — Friends of the Anoka County Library</title>
</head>
<body>
  <!--
    Decap CMS entry point.
    Editors navigate to yourdomain.com/admin, log in via GitHub OAuth,
    and manage blog posts and volunteer opportunities here.
    No HTML or Git knowledge required.

    Netlify Identity handles GitHub OAuth. Setup checklist:
    1. Enable Netlify Identity on your Netlify site (Site Settings → Identity → Enable)
    2. Set Registration to "Invite only"
    3. Under External providers, enable GitHub OAuth
    4. Add collaborators as GitHub repo Write collaborators, then invite via Netlify Identity
    5. Require 2FA on all collaborator GitHub accounts

    Decap docs: https://decapcms.org/docs/
  -->
  <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
</body>
</html>
```

- [ ] **Step 3: Write admin/config.yml**

```yaml
# Decap CMS configuration
# Docs: https://decapcms.org/docs/configuration-options/

backend:
  name: git-gateway
  branch: main  # Branch to update (change to your default branch name if different)

# Where uploaded images are stored
media_folder: "images/uploads"
public_folder: "/images/uploads"

# CMS collections
collections:

  # ── Blog Posts ─────────────────────────────────────────────────────────────
  - name: "blog"
    label: "Blog Posts"
    folder: "blog"
    create: true
    slug: "{{slug}}"           # Filename derived from title; editors can override
    extension: "md"
    fields:
      - label: "Title"
        name: "title"
        widget: "string"
        required: true

      - label: "Author"
        name: "author"
        widget: "string"
        required: true

      - label: "Publish Date"
        name: "date"
        widget: "datetime"
        format: "YYYY-MM-DD"
        date_format: "YYYY-MM-DD"
        time_format: false
        required: true

      - label: "Excerpt"
        name: "excerpt"
        widget: "string"
        hint: "Short summary shown on the blog index and home page. 150 characters max."
        pattern: ['^.{0,150}$', "Excerpt must be 150 characters or fewer"]
        required: false

      - label: "Featured Image (og:image)"
        name: "og:image"
        widget: "image"
        required: false
        hint: "Optional. Used for social media link previews."

      - label: "Body"
        name: "body"
        widget: "markdown"
        required: true

  # ── Volunteer Opportunities ────────────────────────────────────────────────
  - name: "volunteers"
    label: "Volunteer Opportunities"
    folder: "_volunteers"
    create: true
    slug: "{{slug}}"
    extension: "md"
    fields:
      - label: "Title"
        name: "title"
        widget: "string"
        required: true

      - label: "Start Date"
        name: "start_date"
        widget: "datetime"
        format: "YYYY-MM-DD"
        date_format: "YYYY-MM-DD"
        time_format: false
        required: true

      - label: "End Date"
        name: "end_date"
        widget: "datetime"
        format: "YYYY-MM-DD"
        date_format: "YYYY-MM-DD"
        time_format: false
        required: true

      - label: "Description"
        name: "description"
        widget: "markdown"
        required: true

      - label: "Sign-Up URL"
        name: "signup_url"
        widget: "string"
        hint: "External link to Google Form, SignUpGenius, or similar sign-up service."
        required: true

      - label: "Location"
        name: "location"
        widget: "string"
        required: false

      - label: "Volunteers Needed"
        name: "volunteers_needed"
        widget: "number"
        required: false
        hint: "Leave blank if no specific number."

      - label: "Contact Person"
        name: "contact"
        widget: "string"
        required: false
        hint: "Name or email of the volunteer coordinator."
```

- [ ] **Step 4: Commit**

```bash
git add admin/index.html admin/config.yml
git commit -m "feat: add Decap CMS admin entry point and collection config"
```

---

### Task 14: Netlify Identity redirect snippet

**Files:**
- Modify: `index.html` (and all other pages — add identity redirect script)

The Netlify Identity widget requires a small redirect script on the root `index.html` to handle OAuth callbacks. Without it, editors bounced from the GitHub OAuth flow won't land correctly.

- [ ] **Step 1: Add identity widget redirect to index.html (before closing `</body>`)**

In `index.html`, add before the closing `</body>` tag:

```html
  <!-- Netlify Identity: handles redirect from GitHub OAuth after CMS login -->
  <script>
    if (window.netlifyIdentity) {
      window.netlifyIdentity.on('init', function (user) {
        if (!user) {
          window.netlifyIdentity.on('login', function () {
            document.location.href = '/admin/';
          });
        }
      });
    }
  </script>
  <script defer src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add Netlify Identity redirect for CMS OAuth callback on home page"
```

---

## Phase 5 — Accessibility & Performance

### Task 15: Accessibility audit and fixes

**Files:**
- Modify: `style.css` (focus styles already in Phase 1)
- Modify: All HTML pages (verify skip links, ARIA labels, alt text)

- [ ] **Step 1: Verify all pages have the skip link as the first element in `<body>`**

Each page should have this as the first element inside `<body>`:
```html
<a class="skip-link" href="#main-content">Skip to main content</a>
```
And `<main id="main-content">` as the main element.
Confirm this is present in: `index.html`, `about.html`, `events.html`, `membership.html`, `volunteer.html`, `donate.html`, `blog/index.html`.

Expected: All 7 pages have the skip link. (Generated blog post pages have it via `generateBlogPostPage()` in build.js.)

- [ ] **Step 2: Verify all images have alt text**

All `<img>` tags in the codebase should have `alt` attributes. The logo image uses `alt=""` (empty) because the linked text provides the label — the `<a>` wrapping it has `aria-label`. This is correct per WCAG.

```bash
grep -rn '<img' *.html blog/index.html
```

Confirm every `<img>` has `alt=`.

- [ ] **Step 3: Add `lang` attribute verification**

Confirm all pages have `<html lang="en">`.

```bash
grep -L 'lang="en"' *.html blog/index.html
```

Expected: No files listed (all pages have `lang="en"`).

- [ ] **Step 4: Add `prefers-reduced-motion` support to style.css**

Append to `style.css`:

```css
/* =============================================
   REDUCED MOTION
   ============================================= */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 5: Verify color contrast**

Open a browser and use axe DevTools, WAVE, or Lighthouse to verify:
- Body text `#1c1c1c` on white `#ffffff` → contrast ratio ≈ 18:1 ✓ (exceeds 4.5:1 AA)
- Muted text `#555555` on white → contrast ratio ≈ 7.4:1 ✓
- White text on `--color-primary` `#1a5276` → contrast ratio ≈ 7.1:1 ✓
- White text on `--color-accent` `#c0392b` → contrast ratio ≈ 4.6:1 ✓

If brand colors are provided that fail contrast, use the [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to find compliant alternatives.

- [ ] **Step 6: Commit**

```bash
git add style.css
git commit -m "a11y: add reduced-motion media query"
```

---

### Task 16: Performance — image format guidance and script loading

**Files:**
- Modify: `style.css` (no changes needed)
- Review: All HTML files (confirm `defer` on `<script>`)

- [ ] **Step 1: Confirm all script tags use `defer`**

```bash
grep -n '<script' *.html blog/index.html
```

Expected: All `<script src=...>` tags have `defer`. Inline `<script>` blocks (footer year, Netlify Identity) are fine without `defer`.

- [ ] **Step 2: Add WebP image guidance as a comment in style.css**

Append to the top of `style.css` after the opening comment:

```css
/*
  IMAGE GUIDANCE (for content editors):
  - Use WebP format for all photos. Include a JPEG fallback using <picture>:

    <picture>
      <source srcset="images/photo.webp" type="image/webp">
      <img src="images/photo.jpg" alt="Description" width="800" height="533" loading="lazy">
    </picture>

  - Always specify width and height attributes to prevent layout shift (CLS).
  - Use loading="lazy" on all images below the fold.
  - Compress images before uploading: target < 200KB per image.
  - Recommended tool: squoosh.app (free, browser-based)
*/
```

- [ ] **Step 3: Add `loading="lazy"` to the Google Calendar iframe (already present in events.html)**

Confirm `events.html` iframe has `loading="lazy"` — this was included in Task 8 Step 1.

- [ ] **Step 4: Final build and smoke test**

```bash
npm run build
```

Expected: Build completes with no errors.

Open `index.html` in a browser. Verify:
- Navigation renders correctly on desktop
- Hamburger button appears and toggles the menu at < 768px (use browser DevTools responsive mode)
- Recent posts section shows 3 blog post cards
- Skip link appears on Tab keypress
- Footer links work

- [ ] **Step 5: Commit**

```bash
git add style.css
git commit -m "perf: add image format guidance and confirm defer script loading"
```

---

## Phase 6 — Pre-Launch Checklist

### Task 17: Pre-launch verification steps

This task has no code changes — it is a checklist for the deployment handoff (Milestone M6 in the spec).

- [ ] **Netlify setup**
  - [ ] Create Netlify site linked to this GitHub repo
  - [ ] Set build command: `npm ci && npm run build`
  - [ ] Set publish directory: `.` (root)
  - [ ] Verify first deploy succeeds in Netlify dashboard

- [ ] **Custom domain**
  - [ ] Register domain via Namecheap, Google Domains, or Cloudflare Registrar
  - [ ] Add domain in Netlify → Site Settings → Domain management
  - [ ] Point DNS to Netlify nameservers
  - [ ] Confirm HTTPS is active (Netlify provisions Let's Encrypt automatically)
  - [ ] Verify no mixed-content warnings (all assets use relative paths or `https://`)

- [ ] **Google Calendar embed**
  - [ ] Organization creates a dedicated Google Calendar for library events
  - [ ] Set calendar visibility to **Public**
  - [ ] Copy embed URL from Calendar Settings → Integrate calendar → Embed code
  - [ ] Replace `REPLACE_WITH_CALENDAR_ID` placeholder in `events.html`
  - [ ] Confirm calendar renders correctly at the live URL

- [ ] **Donation platform**
  - [ ] Partners confirm external donation platform (PayPal / GoFundMe / Donorbox)
  - [ ] Replace `REPLACE_WITH_DONATION_PLATFORM_URL` placeholder in `donate.html`
  - [ ] Test "Donate Now" button opens the platform in a new tab

- [ ] **Content replacement**
  - [ ] Replace all `<!-- CONTENT: ... -->` placeholders with real copy
  - [ ] Replace logo placeholder (`images/logo.svg`) with client-supplied file
  - [ ] Update Google Fonts to confirmed brand typefaces
  - [ ] Update CSS color tokens (`--color-primary`, `--color-accent`) to brand colors
  - [ ] Verify contrast ratios after brand colors are applied

- [ ] **CMS access**
  - [ ] Enable Netlify Identity (Site Settings → Identity → Enable)
  - [ ] Set Registration to "Invite only"
  - [ ] Enable GitHub as OAuth provider
  - [ ] Add each editor as a GitHub repo **Write** collaborator
  - [ ] Confirm each editor has 2FA enabled on their GitHub account
  - [ ] Test CMS login at `/admin` with one editor account
  - [ ] Publish a test blog post and verify it appears after a Netlify deploy

- [ ] **Accessibility audit**
  - [ ] Run Lighthouse in Chrome DevTools on each page — target ≥ 90 on Performance, Accessibility, Best Practices
  - [ ] Fix any failures before launch

- [ ] **Cross-browser test**
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)
  - [ ] Mobile Safari (iPhone) at 375px viewport
  - [ ] Chrome Android at 360px viewport

---

## Self-Review Against Spec

### Spec Coverage

| Spec Requirement | Covered By |
|---|---|
| Home: hero, mission, featured events, 3 recent posts, CTA | Task 6, Task 11 |
| About: history, board, partners, contact at bottom | Task 7 |
| Events: Google Calendar iframe, no CMS for events | Task 8 |
| Membership: tiers, benefits, mailto join | Task 8 |
| Volunteer: Decap CMS collection, card list, expired handling | Task 9, 11, 13 |
| Donate: impact statement, external donate button, new tab | Task 8 |
| Blog index: paginated, newest first | Task 9, 11 |
| Blog posts: generated from Markdown, author/date/back link | Task 11 |
| Sticky nav with hamburger at < 768px | Task 4, 5 |
| Donate nav link visually distinct | Task 4 |
| Active page link highlighted | Task 5 |
| Footer: copyright, social links, quick nav | Task 3, 4 |
| Decap CMS at /admin for blog + volunteers | Task 13 |
| GitHub OAuth only, no email/password | Task 13, 14 |
| 2FA requirement documented | Task 17 |
| HTTPS + Let's Encrypt | Task 17 |
| Security headers (X-Frame-Options, CSP, etc.) | Task 1 |
| WCAG 2.1 AA: skip link, alt text, contrast, keyboard focus | Task 3, 15 |
| Lighthouse ≥ 90 | Task 17 |
| WebP images with fallback guidance | Task 16 |
| No render-blocking scripts (defer) | Tasks 6–9, 16 |
| Self-hosted assets (no third-party CDN for site assets) | Tasks 6–9 |
| Netlify free tier hosting | Task 1, 17 |
| No backend, no forms, no auth pages | By design |
| Home page recent posts regenerated on content push | Task 11, netlify.toml build trigger |
| Google Calendar as event source of truth | Task 8 |
| Volunteer expired opportunities collapsed | Task 11 |
| Blog pagination at 10 posts/page | Task 11 |

### Gaps / Open Items (from spec Section 10)

These require partner input before pages can be finalized — they are documented as `<!-- CONTENT: ... -->` placeholders in the HTML:

- **Donation platform URL** — `donate.html` placeholder; update `href` when confirmed
- **Impact statement copy** — `donate.html` paragraphs; supplied by organization
- **Brand colors and typography** — update CSS tokens and Google Fonts import once delivered
- **Google Calendar embed URL** — `events.html` placeholder; supplied after calendar is created
- **Contact details** — `about.html` address, phone, email
- **Mission statement** — `index.html` hero paragraph
- **Board member names and bios** — `about.html`
- **Social media links** — footer on all pages
- **Membership tier names, prices, benefits** — `membership.html`

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-08-friends-of-library-website.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — Fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
