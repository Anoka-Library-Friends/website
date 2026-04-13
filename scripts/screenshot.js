// scripts/screenshot.js
// Captures desktop + mobile screenshots of every page and saves them to screenshots/
// Usage: node scripts/build.js && node scripts/screenshot.js

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '../../pages');
const PORT = 4001; // separate port so it doesn't conflict with the test server
const OUT  = join(ROOT, 'screenshots');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.webp': 'image/webp',
};

const PAGES = [
  { name: 'home',                    path: '/' },
  { name: 'about',                   path: '/about.html' },
  { name: 'membership',              path: '/membership.html' },
  { name: 'donate',                  path: '/donate.html' },
  { name: 'events',                  path: '/events.html' },
  { name: 'volunteer',               path: '/volunteer.html' },
  { name: 'blog',                    path: '/blog/' },
  { name: 'blog-book-sale',          path: '/blog/annual-book-sale-2026.html' },
  { name: 'blog-summer-reading',     path: '/blog/summer-reading-program-recap.html' },
  { name: 'blog-welcome',            path: '/blog/welcome-to-our-new-website.html' },
];

const VIEWPORTS = [
  { label: 'desktop', width: 1280, height: 900 },
  { label: 'mobile',  width: 390,  height: 844, isMobile: true, deviceScaleFactor: 3 },
];

function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const urlPath = new URL(req.url, `http://localhost:${PORT}`).pathname;
      const filePath = join(ROOT, urlPath.endsWith('/') ? urlPath + 'index.html' : urlPath);

      if (existsSync(filePath) && statSync(filePath).isFile()) {
        res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
        res.end(readFileSync(filePath));
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
    });
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function run() {
  mkdirSync(OUT, { recursive: true });

  const server = await startServer();
  const browser = await chromium.launch();

  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport:          { width: viewport.width, height: viewport.height },
        deviceScaleFactor: viewport.deviceScaleFactor ?? 1,
        isMobile:          viewport.isMobile ?? false,
        hasTouch:          viewport.isMobile ?? false,
      });
      const page = await context.newPage();

      for (const { name, path } of PAGES) {
        const url = `http://localhost:${PORT}${path}`;
        await page.goto(url, { waitUntil: 'networkidle' });

        // Dismiss any floating elements that may block content, then scroll to top
        await page.evaluate(() => window.scrollTo(0, 0));

        const file = join(OUT, `${name}--${viewport.label}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log(`  ✓ ${name} (${viewport.label}) → screenshots/${name}--${viewport.label}.png`);
      }

      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`\nDone. ${PAGES.length * VIEWPORTS.length} screenshots saved to screenshots/`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
