# Test Checklist

Run through this checklist before every deploy and before handing the site off to the organization.
Check each item off as you go. Items marked **AUTO** are covered by `npm test` — run that first.

---

## 1. Automated Tests

```bash
npm test
```

- [ ] **AUTO** All 14 unit tests pass (parsePost, sortByDateDesc, sortByStartDateAsc, formatDate, isExpired, paginate)

---

## 2. Build

```bash
npm run build
```

- [ ] Build completes with no errors
- [ ] Output reports 3 blog post(s) found (with sample content)
- [ ] Output reports 1 volunteer opportunity(ies) found (with sample content)
- [ ] `blog/welcome-to-our-new-website.html` exists and is non-empty
- [ ] `blog/annual-book-sale-2026.html` exists and is non-empty
- [ ] `blog/summer-reading-program-recap.html` exists and is non-empty
- [ ] `index.html` recent posts section contains blog post cards (not the "No posts yet" fallback)
- [ ] `volunteer.html` volunteer section contains the Book Sale Setup Crew card (not the "No opportunities" fallback)

---

## 3. Navigation

Open `index.html` in a browser (use a local server — see `docs/dev-and-deployment.md`).

- [ ] Logo image renders (no broken image icon)
- [ ] All nav links are present: Home, About & Contact, Events, Membership, Volunteer, Blog, Donate
- [ ] "Donate" nav link has a distinct red/accent background
- [ ] Clicking each nav link navigates to the correct page without a 404

**Active link highlighting:**
- [ ] On `index.html`, the "Home" link has an underline
- [ ] On `about.html`, the "About & Contact" link has an underline
- [ ] On `events.html`, the "Events" link has an underline
- [ ] On `membership.html`, the "Membership" link has an underline
- [ ] On `volunteer.html`, the "Volunteer" link has an underline
- [ ] On `blog/index.html`, the "Blog" link has an underline
- [ ] On `donate.html`, the "Donate" link has an underline
- [ ] On a blog post page (e.g. `blog/welcome-to-our-new-website.html`), the "Blog" link has an underline

---

## 4. Mobile / Hamburger Menu

Resize the browser to below 768px width (or use DevTools → Toggle Device Toolbar).

- [ ] Desktop nav links are hidden
- [ ] Hamburger button (☰) is visible
- [ ] Tapping hamburger opens the menu (`aria-expanded` changes to `true`)
- [ ] Menu closes when a nav link is clicked
- [ ] Menu closes when the Escape key is pressed
- [ ] Focus returns to the hamburger button after closing with Escape

---

## 5. Each Page

### index.html
- [ ] Hero section renders with heading and CTA button
- [ ] "Upcoming Events" section links to `/events.html`
- [ ] "Latest News" section shows 3 blog post cards with titles, dates, and "Read More" links
- [ ] "Join the Friends Today" section has two CTA buttons
- [ ] Footer renders with nav links and copyright year

### about.html
- [ ] History, Board Members, Partners, Contact sections all present
- [ ] Deep link `about.html#contact` scrolls directly to the contact section
- [ ] The `<address>` block renders without italic style (font-style: normal)

### events.html
- [ ] Google Calendar iframe region renders (will show placeholder/error until real calendar ID is set)
- [ ] Page has a note explaining editors should update the calendar ID

### membership.html
- [ ] Three tier cards render: Individual, Family, Sustaining
- [ ] "Family" card is visually highlighted (featured styling, different background)
- [ ] Each "Join" button opens a mailto link with the correct subject line

### volunteer.html
- [ ] Book Sale Setup Crew card renders with date, location, volunteers needed, and Sign Up button
- [ ] "Sign Up" button has `target="_blank"` and `rel="noopener noreferrer"`
- [ ] Expired volunteer opportunities (if any) are collapsed in a `<details>` block

### donate.html
- [ ] "Donate Now" button is present and styled
- [ ] Button has `target="_blank"` and `rel="noopener noreferrer"`
- [ ] Disclaimer text below button is visible

### blog/index.html
- [ ] All 3 sample blog posts listed with title, date, excerpt, and "Read More" link
- [ ] "Read More" links point to the correct generated HTML files

### blog post pages (open one, e.g. blog/welcome-to-our-new-website.html)
- [ ] Title renders as `<h1>`
- [ ] Author and date appear below the title
- [ ] Body content renders with correct Markdown-to-HTML formatting (bold, lists, etc.)
- [ ] "← Back to all posts" link navigates to `/blog/`

---

## 6. Footer

Check on any page:

- [ ] Footer has three columns: org name/address, nav links, social links
- [ ] Copyright year shows the current year (set dynamically by JS)
- [ ] Footer nav links all work
- [ ] On mobile, footer columns stack vertically

---

## 7. Accessibility

- [ ] Pressing Tab on any page shows a visible "Skip to main content" link at the top
- [ ] Clicking "Skip to main content" moves focus to the `<main>` element
- [ ] All interactive elements are reachable and operable by keyboard alone
- [ ] No images have missing `alt` attributes (logo uses `alt=""` intentionally — the wrapping `<a>` has `aria-label`)
- [ ] Run [WAVE browser extension](https://wave.webaim.org/extension/) or Chrome Lighthouse on at least `index.html` — target Accessibility score ≥ 90

---

## 8. Performance

Run Chrome Lighthouse (DevTools → Lighthouse tab → Analyze page load) on `index.html`:

- [ ] Performance ≥ 90
- [ ] Accessibility ≥ 90
- [ ] Best Practices ≥ 90
- [ ] SEO ≥ 90
- [ ] No render-blocking resources flagged (all `<script>` tags use `defer`)

---

## 9. Security Headers

After deploying to Netlify, verify headers are set correctly:

```bash
curl -I https://your-site.netlify.app/
```

- [ ] `Content-Security-Policy` header is present
- [ ] `X-Frame-Options: DENY` is present
- [ ] `X-Content-Type-Options: nosniff` is present
- [ ] `Referrer-Policy: no-referrer` is present
- [ ] No console errors in the browser related to CSP violations (open DevTools → Console)

Check the `/admin/` page separately:
- [ ] `X-Frame-Options: SAMEORIGIN` (not DENY — admin needs iframes)
- [ ] Decap CMS loads without CSP errors

---

## 10. CMS

After deploying to Netlify and configuring Netlify Identity:

- [ ] Navigate to `https://your-domain.com/admin` — Decap CMS login screen appears
- [ ] Log in with a GitHub account that has Write access to the repo
- [ ] "Blog Posts" collection is visible in the CMS sidebar
- [ ] "Volunteer Opportunities" collection is visible
- [ ] Create a test blog post, save, and publish
- [ ] Netlify triggers a new deploy automatically
- [ ] After deploy completes, new blog post appears on `/blog/` and has its own generated HTML page
- [ ] Delete the test blog post and verify it disappears after the next deploy

---

## 11. Cross-Browser

Test on each browser at desktop (1280px) and mobile (375px) widths:

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome (latest) | [ ] | [ ] |
| Firefox (latest) | [ ] | [ ] |
| Safari (latest) | [ ] | [ ] |
| Edge (latest) | [ ] | [ ] |

On each: nav works, hamburger works, fonts load, layout doesn't break.

---

## 12. Before Launch — Content Placeholders

- [ ] All `<!-- CONTENT: ... -->` comments replaced with real copy (see `docs/placeholders.md`)
- [ ] All `REPLACE_WITH_*` values replaced with real URLs
- [ ] `images/logo.svg` replaced with official logo
- [ ] CSS color tokens updated to brand colors
- [ ] Contrast ratios verified after brand colors applied
- [ ] Sample blog posts deleted from `blog/*.md` and replaced with real posts via CMS
- [ ] Sample volunteer opportunity deleted from `_volunteers/book-sale-setup.md` or updated with real data
