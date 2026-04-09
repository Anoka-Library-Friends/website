# Development and Deployment Guide

---

## Prerequisites

- **Node.js 18 or later** — [nodejs.org](https://nodejs.org) (LTS recommended)
- **Git** — [git-scm.com](https://git-scm.com)
- **GitHub account** with access to this repository
- A **Netlify account** (free tier is sufficient) — [netlify.com](https://netlify.com)

Check your Node version:
```bash
node --version
# Should print v18.x.x or higher
```

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_ORG/anoka-library-friends.git
cd anoka-library-friends
```

### 2. Install dependencies

```bash
npm ci
```

This installs `gray-matter` and `marked` (the only two dependencies). There is no dev server framework — the site is plain HTML.

### 3. Run the build

```bash
npm run build
```

The build script reads Markdown files from `blog/` and `_volunteers/`, generates blog post HTML pages, and injects content into `index.html`, `blog/index.html`, and `volunteer.html`. Run this any time you add or change Markdown content files.

### 4. Run the automated tests

```bash
npm test
```

Runs 14 unit tests for the Markdown parsing utilities. All should pass before committing.

### 5. Preview the site locally

Because the site uses absolute paths (`/style.css`, `/main.js`), opening HTML files directly in a browser with `file://` won't work correctly. Use a local static file server:

**Option A — Python (built-in, no install needed):**
```bash
python -m http.server 8080
```
Then open [http://localhost:8080](http://localhost:8080).

**Option B — Node `serve` (install once):**
```bash
npx serve .
```
Then open the URL it prints (usually [http://localhost:3000](http://localhost:3000)).

**Option C — VS Code Live Server extension:**
Right-click `index.html` in VS Code → "Open with Live Server".

---

## Development Workflow

### Adding or editing a blog post

1. Create a new `.md` file in `blog/` with the front matter below:

```markdown
---
title: Your Post Title
author: Your Name
date: 2026-04-09
excerpt: One-sentence summary shown on index and blog pages. Keep under 150 characters.
---

Your post body in Markdown here.
```

2. Run `npm run build` to generate the HTML.
3. Preview at `http://localhost:PORT/blog/your-post-filename.html`.
4. Commit both the `.md` source and the generated `.html` file:

```bash
git add blog/my-new-post.md blog/my-new-post.html index.html blog/index.html
git commit -m "content: add blog post — My Post Title"
```

On Netlify, the build runs automatically on every push, so the HTML is always regenerated from the latest Markdown.

### Adding or editing a volunteer opportunity

1. Create a new `.md` file in `_volunteers/` with:

```markdown
---
title: Opportunity Title
start_date: 2026-05-01
end_date: 2026-05-01
description: What volunteers will do. Markdown is supported.
signup_url: https://forms.google.com/your-form-link
location: Anoka County Library Main Branch
volunteers_needed: 10
contact: volunteer@youremail.org
---
```

2. Run `npm run build`.
3. Preview at `http://localhost:PORT/volunteer.html`.
4. Commit:

```bash
git add _volunteers/opportunity-name.md volunteer.html
git commit -m "content: add volunteer opportunity — Opportunity Title"
```

Opportunities where `end_date` is in the past are automatically collapsed into a "Past Opportunities" disclosure on the volunteer page.

### Changing styles or navigation

- All styles live in `style.css`. Edit there.
- Navigation HTML is duplicated across all static pages (`index.html`, `about.html`, etc.) and in the `navHtml()` function in `scripts/build.js` (used for generated blog post pages). If you add a nav link, update all of those.
- JavaScript for the hamburger menu and active link highlighting lives in `main.js`.

### Changing brand colors or fonts

Edit the CSS custom properties near the top of `style.css`:

```css
--color-primary:      #1a5276;  /* Change to brand primary */
--color-primary-dark: #154360;  /* Darker shade of primary */
--color-accent:       #c0392b;  /* Change to brand accent (used for Donate button) */
--color-accent-dark:  #a93226;  /* Darker shade of accent */
```

For fonts, update the `--font-heading` and `--font-body` tokens and update the Google Fonts `<link>` tag in every HTML page's `<head>`.

---

## Git Branching

Work on features or content changes in a branch, then open a pull request to `main`:

```bash
git checkout -b feature/your-change-name
# make changes
git add ...
git commit -m "..."
git push origin feature/your-change-name
# open PR on GitHub
```

Merging to `main` triggers a Netlify deploy automatically (once connected — see below).

---

## Netlify Deployment

### First-time setup

1. Log in to [netlify.com](https://netlify.com) and click **Add new site → Import an existing project**.
2. Connect your GitHub account and select this repository.
3. Netlify will detect `netlify.toml` automatically. Confirm:
   - **Build command:** `npm ci && npm run build`
   - **Publish directory:** `.` (a single dot — the repo root)
4. Click **Deploy site**.
5. Watch the deploy log. A successful first deploy ends with "Site is live".

### Continuous deployment

After the first setup, every push to `main` triggers a new deploy automatically. No manual action needed.

### Checking deploy status

In the Netlify dashboard → your site → **Deploys**. Each deploy shows build logs. If a deploy fails, the previous version stays live.

To trigger a manual deploy (e.g. after CMS content changes):
- Netlify dashboard → Deploys → **Trigger deploy → Deploy site**

---

## Custom Domain

1. Purchase a domain from Namecheap, Cloudflare Registrar, Google Domains, or similar.
2. In Netlify: **Site configuration → Domain management → Add a domain**.
3. Follow Netlify's instructions to point your DNS to Netlify's nameservers (or add a CNAME for a subdomain).
4. Netlify provisions a free Let's Encrypt SSL certificate automatically — this takes up to 24 hours after DNS propagates.
5. Verify HTTPS is active: the Netlify dashboard shows a green padlock next to your domain.

---

## Netlify Identity and CMS Access

Decap CMS at `/admin` uses Netlify Identity with GitHub OAuth. Complete this setup before giving editors CMS access.

### Enable Netlify Identity

1. Netlify dashboard → **Site configuration → Identity → Enable Identity**.
2. Under **Registration**, set to **Invite only** (prevents public sign-ups).
3. Under **External providers**, enable **GitHub**.

### Add an editor

1. The editor must have a GitHub account with **Write** access to this repository.
   - GitHub → repo → Settings → Collaborators → Add people
2. Send a Netlify Identity invite:
   - Netlify dashboard → Identity → Invite users → enter their email
3. The editor clicks the invite link, completes GitHub OAuth, and lands at `/admin`.
4. Require 2FA on their GitHub account (GitHub → Settings → Password and authentication → Enable 2FA).

### Editor workflow

Once logged in to `/admin`:
1. Click **Blog Posts** or **Volunteer Opportunities** in the sidebar.
2. Click **New [item]**, fill in fields, click **Publish**.
3. Netlify detects the new commit and automatically deploys — the new content is live within ~1–2 minutes.

---

## Environment Checklist Before Going Live

Run through `docs/test-checklist.md` fully, then confirm:

- [ ] `netlify.toml` build command and publish directory are correct
- [ ] All placeholders replaced (see `docs/placeholders.md`)
- [ ] `images/logo.svg` is the real logo
- [ ] CSS brand colors pass contrast checks
- [ ] Custom domain is connected and HTTPS is active
- [ ] Netlify Identity is enabled, set to invite-only, and GitHub OAuth is on
- [ ] At least one editor account has been invited and can log in at `/admin`
- [ ] A test blog post was published via CMS and appeared on the live site
- [ ] Security headers verified with `curl -I https://your-domain.com/`
- [ ] Site passes Lighthouse ≥ 90 on Performance, Accessibility, Best Practices, SEO

---

## Troubleshooting

**Build fails on Netlify with "Cannot find module"**
Run `npm ci` locally, verify it succeeds, and commit any changes to `package-lock.json`.

**Blog posts or volunteer cards not showing after CMS publish**
Check the Netlify deploy log. If the build ran but content didn't appear, confirm the Markdown front matter uses correct field names (`title`, `date`, `author`, etc.) and valid YAML syntax.

**CSP errors in browser console**
A message like "Refused to load script" means a resource isn't in the Content-Security-Policy allowlist in `netlify.toml`. Add the blocked origin to the appropriate `script-src`, `style-src`, or other directive for the affected route.

**Admin page shows blank or "Not Found"**
Confirm `admin/index.html` and `admin/config.yml` are committed and Netlify Identity is enabled.

**Footer year shows wrong year**
JavaScript is required for the footer year. Verify `main.js` is loading without errors (check DevTools Console).

**Hamburger menu doesn't close on link click**
Confirm `main.js` is loaded with `defer`. Check DevTools Console for JavaScript errors.
