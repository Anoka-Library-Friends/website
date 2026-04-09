// scripts/build.js
// Netlify build orchestrator. Run via: npm run build
// Reads Markdown source files, generates/updates HTML files.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
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
    // page 1 → /blog/, page 2+ → /blog/page-2.html etc.
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

function volunteerCardHtml({ data }) {
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
    const indexTemplate = readFileSync(join(BLOG_SRC, 'index.html'), 'utf8');
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
