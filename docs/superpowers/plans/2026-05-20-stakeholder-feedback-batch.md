# Stakeholder Feedback Batch — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the BF-approved subset of stakeholder feedback (nav rename, footer tagline, page reorderings, bio cleanup, GiveMN FAB, alt-text pass) without touching items still pending content or stakeholder response.

**Architecture:** Static HTML/CSS/JS site under `pages/`. Build-time injection via `scripts/build.js`. Changes split across: (a) shared chrome (nav/footer in every static page + `build.js` helpers + Playwright tests); (b) per-page reorders/CSS; (c) board-member Markdown sources + the `boardMembersHtml` renderer; (d) FAB tweak in `main.js`.

**Tech Stack:** Plain HTML/CSS/ES-module JS; `marked` for MD→HTML; Playwright for e2e.

**Important conventions:**
- Run `npm run build` after editing `.md` content, `build.js`, or HTML with `BUILD:*` markers.
- Nav/footer is duplicated across every static page AND `navHtml()`/`footerHtml()` in `build.js`. **All copies must change together** or Playwright will fail.
- The donate FAB already exists in `pages/main.js` (injected via JS into `body`). It's not on `donate.html` (body has `data-page="donate"`).
- Generated blog post HTML is committed alongside `.md` — rebuild before committing.

---

## File Structure

**Modified files (final list):**

| File | Why |
| --- | --- |
| `pages/index.html` | Homepage hero spacing; nav/footer; alt-text on logo |
| `pages/about.html` | Nav/footer; alt-text on board group photo |
| `pages/events.html` | Nav/footer |
| `pages/donate.html` | Reorder sections (buttons-first); nav/footer |
| `pages/membership.html` | "Made Membership Easier" → top; Join button; nav/footer; alt-text |
| `pages/volunteer.html` | Layout overhaul; image shrink; "Get Involved" before images; nav/footer; alt-text |
| `pages/blog/index.html` | Nav/footer |
| `pages/board-members/*.md` (9 files) | Strip photo + bio; keep only role + years |
| `pages/style.css` | Hero top padding; volunteer image-left layout; footer tagline styling |
| `pages/main.js` | FAB href → GiveMN, add target/rel, update aria-label |
| `scripts/build.js` | `navHtml()` "Blog"→"News"; `footerHtml()` tagline; `boardMembersHtml()` strip photo+bio |
| `tests/navigation.spec.js` | "Blog"→"News" labels; footer href list expectations |
| `tests/pages.spec.js` | FAB GiveMN href; News labels; donate-page section order; membership Join button; volunteer hero |

---

## Task 1: Update Donate FAB to GiveMN (one-click external)

**Why first:** Smallest blast radius, fully isolated to `main.js` + one test.

**Files:**
- Modify: `pages/main.js:83-92`
- Modify: `tests/pages.spec.js:62-64` (homepage FAB assertion)
- Verify: `tests/pages.spec.js:155-156` (donate page FAB-absent assertion — unchanged)

- [ ] **Step 1: Update the FAB injection in `pages/main.js`**

Replace lines 83–92 (the `// ── Floating Donate Button ──` block):

```js
  // ── Floating Donate Button ────────────────────────────────────────────────
  // One-click GiveMN donation. External link — opens in a new tab.
  // Suppressed on donate.html via data-page="donate" on <body>.
  if (document.body.dataset.page !== 'donate') {
    const fab = document.createElement('a');
    fab.href = 'https://www.givemn.org/organization/Acl';
    fab.className = 'donate-fab';
    fab.target = '_blank';
    fab.rel = 'noopener noreferrer';
    fab.setAttribute(
      'aria-label',
      'Donate to Friends of the Anoka County Library via GiveMN (opens in a new tab)'
    );
    fab.textContent = '♥ Donate';
    document.body.appendChild(fab);
  }
```

- [ ] **Step 2: Update homepage FAB assertion in `tests/pages.spec.js`**

Replace lines 62–64:

```js
  // Donate FAB present on homepage, links to GiveMN one-click
  await expect(page.locator('.donate-fab')).toBeVisible();
  await expect(page.locator('.donate-fab')).toHaveAttribute('href', 'https://www.givemn.org/organization/Acl');
  await expect(page.locator('.donate-fab')).toHaveAttribute('target', '_blank');
```

- [ ] **Step 3: Run e2e tests**

```bash
npm run test:e2e -- -g "home page"
```

Expected: PASS (home page test now asserts GiveMN href).

- [ ] **Step 4: Commit**

```bash
git add pages/main.js tests/pages.spec.js
git commit -m "feat: floating donate button links to GiveMN for one-click giving"
```

---

## Task 2: Rename "Blog" → "News" in navigation

**Scope:** Label only. URL path stays `/blog/` so existing post URLs, Decap CMS config, and generated pages keep working.

**Files:**
- Modify: 7 static pages × 2 places each (nav + footer): `pages/index.html`, `pages/about.html`, `pages/events.html`, `pages/donate.html`, `pages/membership.html`, `pages/volunteer.html`, `pages/blog/index.html`
- Modify: `scripts/build.js:70-77` and `:90-97` (navHtml + footerHtml `<li>` for Blog)
- Modify: `tests/navigation.spec.js:6-14, 27-32, 143-146`
- Modify: `tests/pages.spec.js:7-15`

- [ ] **Step 1: Update `scripts/build.js` nav helper**

In `navHtml()` (line ~76), change:
```html
<li><a href="/blog/">Blog</a></li>
```
to:
```html
<li><a href="/blog/">News</a></li>
```

In `footerHtml()` (line ~95), change:
```html
<li><a href="/blog/">Blog</a></li>
```
to:
```html
<li><a href="/blog/">News</a></li>
```

- [ ] **Step 2: Update every static page nav + footer**

For each of `pages/index.html`, `pages/about.html`, `pages/events.html`, `pages/donate.html`, `pages/membership.html`, `pages/volunteer.html`, `pages/blog/index.html`:

- In the `<ul id="nav-menu" class="nav-links">` block, change `>Blog<` to `>News<` (only the `/blog/` link).
- In the `<ul class="footer-nav">` block, change `>Blog<` to `>News<` (only the `/blog/` link).

- [ ] **Step 3: Update `tests/navigation.spec.js`**

Line 12 — change `activeText: 'Blog'` to `activeText: 'News'`:
```js
  { url: '/blog/',          activeText: 'News' },
```

Lines 27–32 — change the blog-post-page active-nav test:
```js
test('blog post page marks "News" nav link as active', async ({ page }) => {
  await page.goto('/blog/welcome-to-our-new-website.html');
  const activeLink = page.locator('.nav-links a[aria-current="page"]');
  await expect(activeLink).toHaveCount(1);
  await expect(activeLink).toHaveText('News');
});
```

Lines 142–146 — the `expectedHrefs` array is unchanged (paths didn't change). Footer link count test still passes.

- [ ] **Step 4: Update `tests/pages.spec.js`**

Line 13 — change `{ text: 'Blog', ... }` to:
```js
  { text: 'News',             href: '/blog/' },
```

- [ ] **Step 5: Rebuild and run tests**

```bash
npm run build
npm run test:e2e -- -g "nav"
```

Expected: PASS on every active-nav test (all pages now show "News" as the labeled link to `/blog/`).

- [ ] **Step 6: Commit**

```bash
git add pages/*.html pages/blog/index.html scripts/build.js tests/navigation.spec.js tests/pages.spec.js
git commit -m "feat: rename Blog nav label to News (URL paths unchanged)"
```

---

## Task 3: Footer — tagline under org name

**Goal:** Fill the visual blank space under the bold "Friends of the Anoka County Library" footer cell with a 1-line tagline.

**Tagline copy (draft, confirm before commit):** "Raising funds and awareness for the Anoka County Library since 2003."

**Files:**
- Modify: 7 static pages — the `<div>` containing `<strong>Friends of the Anoka County Library</strong>` inside `<footer class="site-footer">`
- Modify: `scripts/build.js` — `footerHtml()` (line ~87)
- Modify: `pages/style.css` — add `.footer-tagline` style

- [ ] **Step 1: Add CSS class for the tagline**

In `pages/style.css`, after the existing `.footer-*` rules (search for `.footer-inner`), add:

```css
.footer-tagline {
  margin: 0.35rem 0 0;
  font-size: 0.875rem;
  line-height: 1.4;
  opacity: 0.85;
  max-width: 28ch;
}
```

- [ ] **Step 2: Update `footerHtml()` in `scripts/build.js`**

Current line ~87:
```js
      <div><strong>Friends of the Anoka County Library</strong></div>
```

Replace with:
```js
      <div>
        <strong>Friends of the Anoka County Library</strong>
        <p class="footer-tagline">Raising funds and awareness for the Anoka County Library since 2003.</p>
      </div>
```

- [ ] **Step 3: Update every static page footer**

For each of `pages/index.html`, `pages/about.html`, `pages/events.html`, `pages/donate.html`, `pages/membership.html`, `pages/volunteer.html`, `pages/blog/index.html`:

Locate the footer cell that has `<strong>Friends of the Anoka County Library</strong>`. Some pages (`about.html`, `donate.html`, `membership.html`, `index.html`) currently have an empty `<p class="footer-address">` comment placeholder — **replace that** with the tagline:

```html
        <div>
          <strong>Friends of the Anoka County Library</strong>
          <p class="footer-tagline">Raising funds and awareness for the Anoka County Library since 2003.</p>
        </div>
```

For `events.html`, `volunteer.html`, `blog/index.html` (which have just `<div><strong>…</strong></div>`), replace the same way.

- [ ] **Step 4: Rebuild and visually verify**

```bash
npm run build
npx serve pages
```

Open `http://localhost:3000` and confirm the footer's left cell now shows the tagline.

- [ ] **Step 5: Commit**

```bash
git add pages/*.html pages/blog/index.html scripts/build.js pages/style.css
git commit -m "feat: add tagline under organization name in footer"
```

---

## Task 4: Bio simplification — strip photos and paragraphs

**Goal:** Each board member renders as `<h3>Name — Role (years)</h3>` followed by a single line stating tenure. **No `<img>`. No paragraphs of biography.** Per BF's directive, fully delete (no comment-out).

**Files:**
- Modify: all 9 files in `pages/board-members/*.md`
- Modify: `scripts/build.js:238-252` — `boardMembersHtml()`
- Verify: `pages/about.html` BUILD:BOARD_MEMBERS_START block gets rebuilt

- [ ] **Step 1: Strip photo + bio rendering in `boardMembersHtml()`**

Replace `boardMembersHtml()` (lines 238–252 in `scripts/build.js`) with:

```js
function boardMembersHtml(members) {
  if (members.length === 0) return '        <p>Board member information coming soon.</p>';
  return sortBoardMembers(members).map(({ data }) => {
    const yearsHtml = data.years_active ? ` (${data.years_active})` : '';
    const tenureHtml = data.bio ? `\n            <p>${data.bio}</p>` : '';
    return `        <div class="board-member">
          <div class="board-member__content">
            <h3 class="board-member__name">${data.name} &mdash; ${data.title}${yearsHtml}</h3>${tenureHtml}
          </div>
        </div>`;
  }).join('\n');
}
```

(The `bio` frontmatter field is repurposed to hold ONLY the one-line tenure statement — "Board member since YYYY." — not a paragraph. Renderer is unchanged in shape but no longer emits `<img>`.)

- [ ] **Step 2: Rewrite each `pages/board-members/*.md` file**

For each file below, replace the entire contents with the frontmatter + body shown. **Delete any existing photo field and any long biography paragraphs.**

`pages/board-members/betsy-friesen.md`:
```markdown
---
name: Betsy Friesen
title: President
years_active: 2021–present
sort_order: 1
bio: Board member since 2021.
---
```

`pages/board-members/keriann-hollerud.md`:
```markdown
---
name: KeriAnn Hollerud
title: Vice-President
years_active: 2023–present
sort_order: 2
bio: Board member since 2023.
---
```

`pages/board-members/claire-walter-marchetti.md`:
```markdown
---
name: Claire Walter-Marchetti
title: Secretary
years_active: 2026–present
sort_order: 3
bio: Board member since 2026.
---
```

`pages/board-members/jackie-latour.md`:
```markdown
---
name: Jackie LaTour
title: Treasurer
years_active: 2026–present
sort_order: 4
bio: Board member since 2026.
---
```

`pages/board-members/molly-bauer.md`:
```markdown
---
name: Molly Bauer
title: Director
years_active: 2026–present
sort_order: 5
bio: Board member since 2026.
---
```

`pages/board-members/kaylee-dockter.md`:
```markdown
---
name: Kaylee Dockter
title: Director
years_active: 2026–present
sort_order: 6
bio: Board member since 2026.
---
```

`pages/board-members/kelly-foltmer.md`:
```markdown
---
name: Kelly Foltmer
title: Director
years_active: 2026–present
sort_order: 7
bio: Board member since 2026.
---
```

`pages/board-members/angie-homan.md`:
```markdown
---
name: Angie Homan
title: Director
years_active: 2026–present
sort_order: 8
bio: Board member since 2026.
---
```

`pages/board-members/amanda-lefaive.md`:
```markdown
---
name: Amanda Lefaive
title: Director
years_active: 2026–present
sort_order: 9
bio: Board member since 2026.
---
```

(For any member whose actual `years_active` differs, leave the existing value — these are defaults. Check each file first and preserve actual tenure data.)

- [ ] **Step 3: Build and confirm output**

```bash
npm run build
```

Expected: about.html `BUILD:BOARD_MEMBERS_START` block now contains 9 `.board-member` divs with no `<img>` tags and only the short tenure line.

Grep verification:
```bash
```

Use Grep tool: pattern `board-member__photo` in `pages/about.html` → expected zero matches.

- [ ] **Step 4: Commit**

```bash
git add pages/board-members/ pages/about.html scripts/build.js
git commit -m "refactor: simplify board member bios to role + tenure (no photos)"
```

---

## Task 5: Donate page — buttons at top, copy below

**Files:**
- Modify: `pages/donate.html:53-100` (reorder sections)
- Verify: `tests/pages.spec.js:127-157` (donate page test — current copy still passes after reorder)

- [ ] **Step 1: Reorder sections in `pages/donate.html`**

After the `<section class="page-banner">` block (ends at line 60), the order should be:

1. `<section class="donate-section">` (the "Donate Online" + buttons + "Donate by Mail" block — currently lines 71–100). **Move this to be the first content section.**
2. `<section class="section">` containing "Why Your Gift Matters" (currently lines 62–69). **Move this below the donate-section.**

Concretely, swap the two `<section>` blocks between `</section>` of page-banner and the closing `</main>`.

After reorder, the donate-section comes first; the "Why Your Gift Matters" copy follows.

- [ ] **Step 2: Verify with e2e tests**

```bash
npm run test:e2e -- -g "donate page"
```

Expected: PASS. (Test only asserts presence of elements, not order.)

- [ ] **Step 3: Visual check**

```bash
npx serve pages
```

Visit `http://localhost:3000/donate.html` — confirm PayPal + GiveMN buttons appear immediately under the page banner, with copy below.

- [ ] **Step 4: Commit**

```bash
git add pages/donate.html
git commit -m "feat(donate): move donation buttons above explanatory copy"
```

---

## Task 6: Membership — "Made Easier" to top + "Donate to Join" button

**Goal (per Don):** Visitors expect a Join button. Add one in the page-banner area linking to `/donate.html`. Then promote the "We've Made Membership Easier!" block to be the first content section.

**Files:**
- Modify: `pages/membership.html` — banner gets a CTA button; reorder content sections
- Modify: `tests/pages.spec.js:109-123` — current `.tier` assertion is already stale (no `.tier` in current markup); replace with Join-button assertion

- [ ] **Step 1: Add "Donate to Join" button in page banner**

In `pages/membership.html`, replace the existing page-banner block (lines 101–108):

```html
      <section class="page-banner">
        <div class="container">
          <h1>Membership</h1>
          <p class="page-banner__subtitle">
            Support the library — join the Friends today
          </p>
          <p class="page-banner__cta">
            <a href="/donate.html" class="btn btn--primary">Donate to Join</a>
          </p>
        </div>
      </section>
```

- [ ] **Step 2: Add CSS for the page-banner CTA**

In `pages/style.css`, search for `.page-banner__subtitle` and add immediately after that rule:

```css
.page-banner__cta {
  margin-top: 1.25rem;
}
.page-banner__cta .btn {
  display: inline-block;
}
```

- [ ] **Step 3: Move "We've Made Membership Easier!" to be the first section**

In `pages/membership.html`, the current order inside `<div class="container">` (within `<section class="section">`) is:

1. Two intro paragraphs about libraries' value (lines 112–131)
2. Big check `<figure>` (lines 133–139)
3. "How You Can Help Power Our Mission" + list (lines 141–159)
4. "We've Made Membership Easier!" (lines 161–191)

Reorder to:

1. "We've Made Membership Easier!" block (move to top)
2. The two intro paragraphs about libraries' value
3. Big check `<figure>`
4. "How You Can Help Power Our Mission" + list

Remove the `class="mt-xl"` from "We've Made Membership Easier!" h2 (it's now first, no top margin needed) and add `class="mt-xl"` to the next h2 that follows it.

- [ ] **Step 4: Update the membership page test**

Replace lines 109–123 of `tests/pages.spec.js` with:

```js
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

  // GiveMN + PayPal links are present in the page body
  await expect(page.locator('a[href*="givemn.org"]')).toHaveCount(1);
  await expect(page.locator('a[href*="paypal.com"]')).toHaveCount(1);
});
```

- [ ] **Step 5: Run tests + visual check**

```bash
npm run test:e2e -- -g "membership page"
npx serve pages
```

Confirm Join button is the first prominent CTA at top, "Made Easier" section appears immediately under banner.

- [ ] **Step 6: Commit**

```bash
git add pages/membership.html pages/style.css tests/pages.spec.js
git commit -m "feat(membership): add Donate-to-Join CTA and promote 'Made Easier' section to top"
```

---

## Task 7: Volunteer page layout overhaul

**Goal:** Shrink hero image; move "Get Involved" above all images; remaining body uses image-left / copy-right layout.

**Files:**
- Modify: `pages/volunteer.html` — reorder + shrink image
- Modify: `pages/style.css` — add `.media-row` two-column layout

- [ ] **Step 1: Add `.media-row` CSS for image-left / copy-right**

In `pages/style.css`, near other layout utilities (search for `.grid-3` for a nearby anchor), add:

```css
.media-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 2rem;
  align-items: start;
  margin: 2rem 0;
}
.media-row img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}
@media (max-width: 720px) {
  .media-row { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Rewrite the volunteer page main content**

In `pages/volunteer.html`, replace lines 53–118 (everything inside `<main id="main-content">`) with:

```html
  <main id="main-content">

    <section class="page-banner">
      <div class="container">
        <h1>Volunteer</h1>
        <p class="page-banner__subtitle">Make a difference in your community</p>
      </div>
    </section>

    <section class="section">
      <div class="container">

        <h2>Get Involved</h2>
        <p>If you are interested in volunteering with FACL, please email <a href="mailto:FriendsoftheACL@gmail.com">FriendsoftheACL@gmail.com</a> and we will put you on our volunteer list. You do not need to be a member to volunteer.</p>

        <div class="media-row mt-xl">
          <figure>
            <img src="/images/volunteer.jpg" alt="Several people stand on either side of registration tables draped in black, arranging name tags for the 2025 gala: An Evening with Friends and Authors. They are dressed up for the occasion." loading="lazy">
          </figure>
          <div>
            <p>Volunteering with Friends of the Anoka County Library (FACL) doesn&rsquo;t just help us and the ACL, it also offers significant personal benefits like:</p>
            <ul class="prose-list">
              <li><strong>Mental Well-being:</strong> Studies consistently show that working on behalf of someone else reduces stress and increases feelings of purpose.</li>
              <li><strong>Networking:</strong> It can connect you with people whom you might not meet in your professional or social bubbles.</li>
            </ul>
          </div>
        </div>

        <h2 class="mt-xl">How You Can Help</h2>
        <p>We are always looking for volunteers to help at our fundraising events, including:</p>
        <ul class="prose-list">
          <li>3 book sales per year (fall, winter, and spring)</li>
          <li>Our second annual gala &ldquo;An Evening With Friends &amp; Authors&rdquo; on October 15</li>
        </ul>
        <p>Additionally, we help raise awareness of Friends&rsquo; activities and ACL programs and services at community outreach events.</p>

        <!-- TODO(don): drop tabling + book-sale volunteer photos into pages/images/ and add a second .media-row here. -->

        <div class="mt-xl">
          <!-- BUILD:VOLUNTEER_OPPORTUNITIES_START -->
<p>No volunteer opportunities are currently listed. Check back soon!</p>
<!-- BUILD:VOLUNTEER_OPPORTUNITIES_END -->
        </div>

        <!-- BUILD:PAST_OPPORTUNITIES_START -->
<!-- BUILD:PAST_OPPORTUNITIES_END -->

      </div>
    </section>
  </main>
```

(Note: the `BUILD:*` markers are preserved exactly so `build.js` can still inject opportunities. The shrunken hero image now lives inside `.media-row` so its column = 1/3 of the row width on desktop, full width on mobile.)

- [ ] **Step 3: Rebuild + e2e**

```bash
npm run build
npm run test:e2e -- -g "volunteer page"
```

Expected: PASS — the page test asserts `.volunteer-card` (still injected) and `h1` (still "Volunteer").

- [ ] **Step 4: Visual check**

`http://localhost:3000/volunteer.html` — confirm "Get Involved" appears immediately under banner, hero image is now smaller (right-of-copy on desktop).

- [ ] **Step 5: Commit**

```bash
git add pages/volunteer.html pages/style.css
git commit -m "feat(volunteer): promote Get Involved, shrink hero, add image-left layout"
```

---

## Task 8: Homepage — reduce space above logo

**Files:**
- Modify: `pages/style.css` — `.hero` top padding

- [ ] **Step 1: Inspect current hero CSS**

Use Grep tool: pattern `^\.hero` in `pages/style.css` to locate the hero rule.

- [ ] **Step 2: Reduce top padding**

In the `.hero` selector block, halve the top padding (or `padding-block-start`). If current value is e.g. `padding: 6rem 0 4rem;`, change to `padding: 3rem 0 4rem;`. (Exact value depends on what's there — apply roughly 50% reduction to the top.)

- [ ] **Step 3: Visual check across breakpoints**

```bash
npx serve pages
```

Open `http://localhost:3000/`. Check at both 1280px and 375px widths that the logo and CTA buttons sit higher without overlapping the header.

- [ ] **Step 4: Run e2e to confirm nothing breaks**

```bash
npm run test:e2e -- -g "home page"
```

Expected: PASS (test asserts content presence, not exact spacing).

- [ ] **Step 5: Commit**

```bash
git add pages/style.css
git commit -m "style(home): reduce top padding on hero so logo + CTAs pull up"
```

---

## Task 9: Accessibility — apply written alt text + logo labels

**Files:**
- Modify: `pages/about.html:184-193` — board group photo alt
- Modify: `pages/membership.html:133-139` — big check alt
- Modify: `pages/volunteer.html` — hero alt (already updated in Task 7; verify exact string matches Don's text)
- Modify: `pages/index.html:60` — homepage logo alt
- Audit: any standalone logo `<img>` should say "Friends of the Anoka County Library logo"

- [ ] **Step 1: Update About page board group photo alt**

In `pages/about.html:187`, replace:
```html
alt="2026 Friends of the Anoka County Library Board Members"
```
with:
```html
alt="Seven white women from the Friends' Board are behind a black-clothed table smiling at the camera. Behind them a large screen gives the event title, '9th Annual Featured Local Authors Fair,' and logos of the sponsors: Clean Water Land and Legacy Amendment and Friends of the Anoka County Library."
```

- [ ] **Step 2: Update Membership big-check alt**

In `pages/membership.html:136`, replace:
```html
alt="Friends of the Anoka County Library presenting a donation check to the Anoka County Library"
```
with:
```html
alt="Seven white women from the Friends' Board stand behind a large prop check dated 04/27/2026 and made out to Anoka County Library for the sum of $25,000. A couple point proudly at the total box."
```

- [ ] **Step 3: Verify Volunteer hero alt**

The new alt text was already written into Task 7's HTML. Double-check the exact string:
> "Several people stand on either side of registration tables draped in black, arranging name tags for the 2025 gala: An Evening with Friends and Authors. They are dressed up for the occasion."

- [ ] **Step 4: Update Homepage hero logo alt**

In `pages/index.html:60`, the hero logo currently has `alt="Friends of the Anoka County Library"`. Per Don's guidance ("make sure the 'logo' anywhere on the pages is labeled as such"), change to:
```html
<img src="/images/logo-white.webp" alt="Friends of the Anoka County Library logo" class="hero__logo" width="640" height="224">
```

(The nav logo at the top of every page uses `alt=""` because the adjacent text `nav-logo-text` provides the accessible name — leave that as-is, it's correct.)

- [ ] **Step 5: Run accessibility tests**

```bash
npm run test:e2e -- tests/accessibility.spec.js
```

Expected: PASS — axe-core picks up any contrast/role issues; the new alt strings are valid alt text.

- [ ] **Step 6: Commit**

```bash
git add pages/about.html pages/membership.html pages/volunteer.html pages/index.html
git commit -m "a11y: apply detailed alt text to hero/board/check photos; label homepage logo"
```

---

## Task 10: Final verification

- [ ] **Step 1: Full build + test pass**

```bash
npm run test:all
```

Expected: unit + build + e2e all green.

- [ ] **Step 2: Manual smoke**

```bash
npx serve pages
```

Click through Home → About → Events → Membership → Volunteer → News → Donate → confirm:
- "News" appears in nav and footer on every page
- Footer tagline shows on every page
- FAB visible on every page except Donate
- FAB opens GiveMN in new tab
- About page has 9 board members with NO photos and just role + tenure line
- Donate page: buttons immediately under banner
- Membership: "Donate to Join" button at top, "Made Easier" first section
- Volunteer: "Get Involved" first, smaller hero image
- Homepage: logo + buttons pulled up

- [ ] **Step 3: Update the manual QA checklist if needed**

If any of the above don't match what's documented in `docs/test-checklist.md`, update that file too — it's the pre-deploy QA list.

---

## Notes for the implementer

- **Don't touch `/admin/*` or `pages/admin/`** — Decap CMS has its own conventions and a relaxed CSP; out of scope.

- **Don't rename URL paths** — `/blog/` stays. Only the human-readable nav label changes.

- **Conditional homepage stripe (white logo + teal subtitle)** is NOT in this plan. If we get through 1–10 quickly, prototype it as a separate follow-up.
