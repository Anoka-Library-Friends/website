// scripts/test-server.js
// Minimal static file server for Playwright e2e tests.
// Serves files exactly as-is with no URL rewriting, so window.location.pathname
// always matches the href attributes used in the site's nav links.

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT  = join(fileURLToPath(import.meta.url), '../..');
const PORT  = parseInt(process.env.PORT || '4000', 10);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.webp': 'image/webp',
  '.yml':  'application/yaml',
  '.json': 'application/json',
  '.md':   'text/plain',
};

const server = createServer((req, res) => {
  const urlPath = new URL(req.url, `http://localhost:${PORT}`).pathname;
  // Map trailing-slash requests to index.html (e.g. /blog/ → blog/index.html)
  const filePath = join(ROOT, urlPath.endsWith('/') ? urlPath + 'index.html' : urlPath);

  if (existsSync(filePath) && statSync(filePath).isFile()) {
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
    res.end(readFileSync(filePath));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => console.log(`[test-server] http://localhost:${PORT}`));
