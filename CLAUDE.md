# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build          # Regenerate HTML from Markdown sources and inject dynamic content. Always run after editing .md content, build.js, or HTML with BUILD:* markers.
npm test               # Unit tests (node --test) for scripts/parse-markdown.js — fast, no browser.
npm run test:e2e       # Builds, then runs Playwright against scripts/test-server.js on :4000.
npm run test:all       # Unit + build + e2e.
npm run screenshot     # Builds, then captures page screenshots via scripts/screenshot.js.
```

Run a single Playwright spec or test:
```bash
npx playwright test tests/pages.spec.js
npx playwright test -g "about page"
npx playwright test --project=desktop          # skip mobile project
npx playwright test --headed --debug           # open browser, step through
```

Local preview (no hot reload — this is a plain static site):
```bash
node scripts/test-server.js                    # serves pages/ on http://localhost:4000
```

## Architecture

### Static site with a build-time injection pipeline

The site is plain HTML/CSS/JS served from `pages/` (Netlify `publish = "pages"`). There is no framework and no client-side templating. Dynamic content is injected at **build time** by `scripts/build.js`, which runs on every Netlify deploy.

Content flows Markdown → HTML:
- `pages/blog/*.md` → individual post HTML files + injected into `pages/blog/index.html` (paginated) + 3 newest injected into `pages/index.html`
- `pages/volunteers/*.md` → injected into `pages/volunteer.html` (expired items auto-collapse into a `<details>` block based on `end_date`)
- `pages/board-members/*.md` → injected into `pages/about.html`
- Google Calendar iCal (hardcoded URL in `build.js`) → upcoming events injected into `pages/events.html` and `pages/index.html`. If the fetch fails, existing HTML is left untouched (graceful degradation).

`scripts/parse-markdown.js` holds **pure** parsing/sorting/pagination helpers; all I/O lives in `scripts/build.js`. Unit tests cover `parse-markdown.js` only.

### Injection marker convention

HTML files contain paired `<!-- BUILD:NAME_START -->` / `<!-- BUILD:NAME_END -->` comments. `build.js::injectBetweenMarkers` does in-place rewrites. **Never delete these markers** — the build silently no-ops (just warns) when markers are missing. When you need to inject new content, pick a marker name and add both the start/end pair in the HTML before wiring it up in `build.js::build()`.

### Shared nav/footer are duplicated by design

Static pages in `pages/` each contain their own full `<nav>` and `<footer>` HTML. Generated blog post pages use `navHtml()` / `footerHtml()` in `build.js` instead. **When a nav link or footer changes, update all of the following:**
- Every static `pages/*.html` (and `pages/blog/index.html`)
- `navHtml()` and `footerHtml()` in `scripts/build.js`
- Test expectations in `tests/navigation.spec.js` and `tests/pages.spec.js`

### Playwright setup quirks

- `playwright.config.cjs` runs `node scripts/build.js && node scripts/test-server.js` as the `webServer`, so tests always see a freshly built site. Locally, `reuseExistingServer: true` lets you skip the rebuild if a server is already on :4000.
- Two projects: **desktop** runs everything; **mobile** (Pixel 5) only runs `navigation.spec.js` — page/a11y coverage is desktop-only.
- `tests/accessibility.spec.js` uses `@axe-core/playwright` for automated a11y checks.

### Decap CMS + Netlify Identity

`pages/admin/` is a Decap CMS instance backed by `git-gateway` + Netlify Identity with GitHub OAuth. Collections for `blog`, `volunteers`, and `board-members` are defined in `pages/admin/config.yml`. Editors publishing via `/admin` commit Markdown to `main`, which triggers a Netlify build that re-runs the injection pipeline.

### CSP is strict and route-scoped

`netlify.toml` defines two CSP policies:
- `/*` — strict: no inline scripts, locked-down `script-src`, `style-src`, etc.
- `/admin/*` — relaxed: Decap needs `'unsafe-eval'`/`'unsafe-inline'` and various third-party origins.

Adding a new external resource (font provider, embed, analytics) requires updating the appropriate CSP directive in `netlify.toml`, or browsers will block it silently.

### Design tokens

Brand colors, fonts, spacing all live as CSS custom properties near the top of `pages/style.css`. Prefer editing tokens over hardcoded values. The current palette ("Forest & Gold") lives on the `style/forest-gold-palette` branch, not yet merged to `main`.

## Repo conventions

- ES modules only (`"type": "module"` in `package.json`).
- `docs/test-checklist.md` is the manual pre-deploy QA list; keep it in sync when adding user-facing features.
- Generated HTML files (blog post pages, page-N.html) **are committed** alongside their `.md` sources so the site works even if a build ever fails.
