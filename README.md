# Friends of the Anoka County Library

Static website for the **Friends of the Anoka County Library (FACL)**, a nonprofit supporting the [Anoka County Library](https://www.anokacountymn.gov/2550/Locations-Hours) system in Minnesota.

The site is plain HTML/CSS/JS with a small build-time injection pipeline — no framework, no client-side templating. It is hosted on Netlify and edited either directly or through a [Decap CMS](https://decapcms.org/) admin at `/admin`.

## Quick start

```bash
npm ci          # install dependencies (Node 18+; developed on Node 24)
npm run build   # regenerate HTML from Markdown and inject dynamic content
npx serve pages # preview at http://localhost:3000
```

> **Always run `npm run build` after editing any `.md` content, `scripts/build.js`, or HTML containing `BUILD:*` markers.** The build is what stitches Markdown into the static pages.

## How it works

The site lives in `pages/` (Netlify `publish = "pages"`). Content is authored as Markdown and injected into HTML at **build time** by `scripts/build.js`, which runs on every Netlify deploy.

Content flow (Markdown → HTML):

- `pages/news/*.md` → individual post pages + injected into the paginated `pages/news/index.html` + 3 newest injected into `pages/index.html`
- `pages/volunteers/*.md` → injected into `pages/volunteer.html` (expired items auto-collapse based on `end_date`)
- `pages/board-members/*.md` → injected into `pages/about.html`
- Google Calendar iCal feed → upcoming events injected into `pages/events.html` and `pages/index.html` (graceful degradation: if the fetch fails, existing HTML is left untouched)

### Injection markers

HTML files contain paired `<!-- BUILD:NAME_START -->` / `<!-- BUILD:NAME_END -->` comments. `build.js` rewrites the content between them in place. **Never delete these markers** — the build silently no-ops (with a warning) when a marker is missing.

### Shared nav & footer

Static pages each contain their own full `<nav>` and `<footer>` (duplicated by design); generated post pages use `navHtml()` / `footerHtml()` in `build.js`. When a nav link or the footer changes, update **all** of:

- every static `pages/*.html` (and `pages/news/index.html`)
- `navHtml()` and `footerHtml()` in `scripts/build.js`
- test expectations in `tests/navigation.spec.js` and `tests/pages.spec.js`

Generated HTML files are **committed** alongside their `.md` sources so the site still works if a build ever fails.

## Project layout

```
pages/                 Published site (HTML/CSS/JS, images, robots.txt, sitemap.xml)
  admin/               Decap CMS instance (git-gateway + Netlify Identity)
  news/                News posts (.md source + generated .html)
  volunteers/          Volunteer opportunity sources (.md)
  board-members/       Board member bios (.md)
  style.css            Design tokens + all styling
scripts/
  build.js             Build pipeline (all file I/O + Netlify build entrypoint)
  parse-markdown.js    Pure parsing / sorting / pagination helpers (unit-tested)
  test-server.js       Serves pages/ on :4000 for e2e tests
  screenshot.js        Page screenshot capture
tests/                 Playwright specs (pages, navigation, accessibility)
netlify.toml           Build config, redirects, CSP + security headers
```

## Editing content

- **Via CMS:** log in at `/admin` with a Netlify Identity account (email/password — editors do **not** need a GitHub account; `git-gateway` commits on their behalf). Publishing commits Markdown to `main`, triggering a Netlify build.
- **Directly:** add or edit a `.md` file in `news/`, `volunteers/`, or `board-members/`, run `npm run build`, and commit both the `.md` and the generated `.html`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run build` | Regenerate HTML from Markdown and inject dynamic content |
| `npm test` | Unit tests for `scripts/parse-markdown.js` (fast, no browser) |
| `npm run test:e2e` | Build, then run Playwright against the test server on :4000 |
| `npm run test:all` | Unit + build + e2e |
| `npm run screenshot` | Build, then capture page screenshots |

Run a single Playwright spec:

```bash
npx playwright test tests/pages.spec.js
npx playwright test -g "about page"
npx playwright test --project=desktop   # skip the mobile project
```

Testing notes: `playwright.config.cjs` builds and serves a fresh site as its `webServer`. Two projects — **desktop** runs everything; **mobile** (Pixel 5) runs only `navigation.spec.js`. Accessibility is checked with `@axe-core/playwright`.

## Deployment

Hosted on **Netlify**. Pushes to `main` run `npm ci && npm run build` and publish `pages/`. `netlify.toml` also defines:

- a `/blog/* → /news/*` 301 redirect (legacy URLs)
- a strict Content-Security-Policy for `/*` and a relaxed one for `/admin/*` (Decap needs `unsafe-eval`/`unsafe-inline`)

Adding a new external resource (font, embed, analytics) requires updating the appropriate CSP directive in `netlify.toml`, or browsers will block it silently.

## License

MIT
