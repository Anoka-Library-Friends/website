# Board Members Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make board members editable by non-technical volunteers via Decap CMS, sourced from markdown files and injected into `about.html` at build time.

**Architecture:** One `.md` file per board member in `board-members/`, parsed by the existing `readMarkdownDir()` helper, sorted by a new pure `sortBoardMembers()` function, rendered to HTML by `boardMembersHtml()` in `build.js`, and injected into `about.html` between comment markers — exactly the same pattern as volunteer opportunities. A Decap CMS collection exposes these files to non-technical editors.

**Tech Stack:** Node.js ESM, gray-matter, existing `build.js` + `parse-markdown.js` pipeline, Decap CMS (`admin/config.yml`).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `scripts/parse-markdown.js` | Modify | Add pure `sortBoardMembers()` function |
| `scripts/parse-markdown.test.js` | Modify | Tests for `sortBoardMembers()` |
| `board-members/betsy-friesen.md` | Create | Betsy's data (migrated from hardcoded HTML) |
| `about.html` | Modify | Replace hardcoded block with comment markers |
| `scripts/build.js` | Modify | Add `boardMembersHtml()` + build step |
| `admin/config.yml` | Modify | Add `board-members` CMS collection |

---

## Task 1: Add `sortBoardMembers` to `parse-markdown.js` (TDD)

**Files:**
- Modify: `scripts/parse-markdown.js`
- Modify: `scripts/parse-markdown.test.js`

- [ ] **Step 1: Add the import and failing tests**

Open `scripts/parse-markdown.test.js`. Add `sortBoardMembers` to the import line at the top:

```js
import {
  parsePost,
  sortByDateDesc,
  sortByStartDateAsc,
  formatDate,
  isExpired,
  paginate,
  sortBoardMembers,
} from './parse-markdown.js';
```

Append these tests at the end of the file:

```js
// ── sortBoardMembers ──────────────────────────────────────────────────────────

test('sortBoardMembers: numbered members come before unnumbered', () => {
  const members = [
    { data: { name: 'Alice', title: 'Treasurer' } },
    { data: { name: 'Bob', title: 'President', sort_order: 1 } },
  ];
  const sorted = sortBoardMembers(members);
  assert.equal(sorted[0].data.name, 'Bob');
  assert.equal(sorted[1].data.name, 'Alice');
});

test('sortBoardMembers: numbered members sort by sort_order ascending', () => {
  const members = [
    { data: { name: 'Carol', title: 'Vice President', sort_order: 2 } },
    { data: { name: 'Bob', title: 'President', sort_order: 1 } },
  ];
  const sorted = sortBoardMembers(members);
  assert.equal(sorted[0].data.name, 'Bob');
  assert.equal(sorted[1].data.name, 'Carol');
});

test('sortBoardMembers: same sort_order breaks tie alphabetically by name', () => {
  const members = [
    { data: { name: 'Zelda', title: 'Director', sort_order: 2 } },
    { data: { name: 'Amy', title: 'Director', sort_order: 2 } },
  ];
  const sorted = sortBoardMembers(members);
  assert.equal(sorted[0].data.name, 'Amy');
  assert.equal(sorted[1].data.name, 'Zelda');
});

test('sortBoardMembers: unnumbered members sort alphabetically by name', () => {
  const members = [
    { data: { name: 'Zelda', title: 'Director' } },
    { data: { name: 'Amy', title: 'Secretary' } },
  ];
  const sorted = sortBoardMembers(members);
  assert.equal(sorted[0].data.name, 'Amy');
  assert.equal(sorted[1].data.name, 'Zelda');
});

test('sortBoardMembers: does not mutate the input array', () => {
  const members = [
    { data: { name: 'Bob', title: 'President', sort_order: 1 } },
    { data: { name: 'Alice', title: 'Treasurer' } },
  ];
  const original = [...members];
  sortBoardMembers(members);
  assert.deepEqual(members, original);
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
node --test scripts/parse-markdown.test.js
```

Expected: 5 new tests fail with `sortBoardMembers is not a function` (or similar). All existing tests still pass.

- [ ] **Step 3: Implement `sortBoardMembers` in `parse-markdown.js`**

Append this export to the end of `scripts/parse-markdown.js`:

```js
/**
 * Sort board members: numbered (sort_order defined) first by sort_order asc,
 * then unnumbered alphabetically by name. Ties within same sort_order sort by name.
 * @param {Array<{ data: { name?: string, sort_order?: number } }>} members
 * @returns {Array}
 */
export function sortBoardMembers(members) {
  return [...members].sort((a, b) => {
    const aHasOrder = a.data.sort_order != null;
    const bHasOrder = b.data.sort_order != null;
    if (aHasOrder && bHasOrder) {
      if (a.data.sort_order !== b.data.sort_order) {
        return a.data.sort_order - b.data.sort_order;
      }
      return (a.data.name || '').localeCompare(b.data.name || '');
    }
    if (aHasOrder) return -1;
    if (bHasOrder) return 1;
    return (a.data.name || '').localeCompare(b.data.name || '');
  });
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
node --test scripts/parse-markdown.test.js
```

Expected: all tests pass, including the 5 new ones.

- [ ] **Step 5: Commit**

```bash
git add scripts/parse-markdown.js scripts/parse-markdown.test.js
git commit -m "feat: add sortBoardMembers pure function with tests"
```

---

## Task 2: Create `board-members/betsy-friesen.md`

**Files:**
- Create: `board-members/betsy-friesen.md`

- [ ] **Step 1: Create the directory and data file**

Create `board-members/betsy-friesen.md` with this exact content:

```markdown
---
name: "Betsy Friesen"
title: "President"
sort_order: 1
years_active: "2021–present"
photo: "/images/board-member-portrait/betsy.webp"
bio: "Betsy is the current president of Friends of the Anoka County Library (FACL). She has served on the Board off and on since 2021. She mentors elementary school readers through the ACL Reading Bridge program. She also volunteers at Wargo Nature Center, including the cataloging and care of the Center's library, and provides a monthly story/craft time for pre-schoolers. Betsy is a retired University of Minnesota Libraries cataloging and systems librarian."
---
```

- [ ] **Step 2: Commit**

```bash
git add board-members/betsy-friesen.md
git commit -m "feat: add Betsy Friesen board member data file"
```

---

## Task 3: Replace hardcoded block in `about.html` with comment markers

**Files:**
- Modify: `about.html:75-81`

- [ ] **Step 1: Replace the hardcoded card with comment markers**

In `about.html`, find this block (lines 75–81):

```html
        <div style="margin-top: 1rem; display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap;">
          <img src="/images/board-member-portrait/betsy.webp" alt="Betsy Friesen" width="120" height="120" style="border-radius: 50%; object-fit: cover; flex-shrink: 0;">
          <div>
            <h3 style="font-size: 1.1rem;">Betsy Friesen &mdash; President (2026)</h3>
            <p>Betsy is the current president of Friends of the Anoka County Library (FACL). She has served on the Board off and on since 2021. She mentors elementary school readers through the ACL Reading Bridge program. She also volunteers at Wargo Nature Center, including the cataloging and care of the Center's library, and provides a monthly story/craft time for pre-schoolers. Betsy is a retired University of Minnesota Libraries cataloging and systems librarian.</p>
          </div>
        </div>
```

Replace it with:

```html
        <!-- BUILD:BOARD_MEMBERS_START -->
        <!-- BUILD:BOARD_MEMBERS_END -->
```

The `<h2>Board Members</h2>` heading on line 74 stays in place — only the card div is replaced.

- [ ] **Step 2: Commit**

```bash
git add about.html
git commit -m "chore: replace hardcoded board member card with build markers"
```

---

## Task 4: Add `boardMembersHtml()` and build step to `build.js`

**Files:**
- Modify: `scripts/build.js`

- [ ] **Step 1: Add `sortBoardMembers` to the import and add the `BOARD_SRC` constant**

In `scripts/build.js`, update the import from `./parse-markdown.js`:

```js
import {
  parsePost,
  sortByDateDesc,
  sortByStartDateAsc,
  formatDate,
  isExpired,
  paginate,
  sortBoardMembers,
} from './parse-markdown.js';
```

Add `BOARD_SRC` constant alongside the other source dir constants (after `VOL_SRC`):

```js
const BOARD_SRC  = join(ROOT, 'board-members');
```

- [ ] **Step 2: Add the `boardMembersHtml()` rendering function**

Add this function to `scripts/build.js` after the `volunteerCardHtml()` function:

```js
// ── Board member card HTML ────────────────────────────────────────────────────

function boardMembersHtml(members) {
  if (members.length === 0) return '        <p>Board member information coming soon.</p>';
  return sortBoardMembers(members).map(({ data }) => {
    const photoHtml = data.photo
      ? `\n          <img src="${data.photo}" alt="${data.name}" width="120" height="120" style="border-radius: 50%; object-fit: cover; flex-shrink: 0;">`
      : '';
    const yearsHtml = data.years_active ? ` (${data.years_active})` : '';
    const bioHtml = data.bio ? `\n            <p>${data.bio}</p>` : '';
    return `        <div style="margin-top: 1rem; display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap;">${photoHtml}
          <div>
            <h3 style="font-size: 1.1rem;">${data.name} &mdash; ${data.title}${yearsHtml}</h3>${bioHtml}
          </div>
        </div>`;
  }).join('\n');
}
```

- [ ] **Step 3: Add the board members build step inside `build()`**

Inside the `build()` function in `scripts/build.js`, add this block after the volunteer opportunities section (after the `console.log('[build] Injected volunteer opportunities...')` line):

```js
  // 5. Board members
  const allMembers = readMarkdownDir(BOARD_SRC);
  console.log(`[build] Found ${allMembers.length} board member(s).`);
  injectBetweenMarkers(
    join(ROOT, 'about.html'),
    'BUILD:BOARD_MEMBERS_START',
    'BUILD:BOARD_MEMBERS_END',
    boardMembersHtml(allMembers)
  );
  console.log('[build] Injected board members into about.html');
```

- [ ] **Step 4: Run the build and verify output**

```bash
node scripts/build.js
```

Expected console output (among other lines):

```
[build] Found 1 board member(s).
[build] Injected board members into about.html
[build] Done.
```

Then verify `about.html` now contains Betsy's generated card between the markers:

```bash
node --input-type=module -e "import { readFileSync } from 'fs'; const h = readFileSync('about.html','utf8'); console.log(h.includes('Betsy Friesen') && h.includes('BUILD:BOARD_MEMBERS_START') ? 'OK' : 'FAIL')"
```

Expected output: `OK`

- [ ] **Step 5: Commit**

```bash
git add scripts/build.js about.html
git commit -m "feat: generate board member cards from markdown at build time"
```

---

## Task 5: Add `board-members` collection to `admin/config.yml`

**Files:**
- Modify: `admin/config.yml`

- [ ] **Step 1: Append the collection**

Add the following at the end of `admin/config.yml`:

```yaml
  # ── Board Members ──────────────────────────────────────────────────────────
  - name: "board-members"
    label: "Board Members"
    folder: "board-members"
    create: true
    slug: "{{slug}}"
    extension: "md"
    fields:
      - label: "Name"
        name: "name"
        widget: "string"
        required: true

      - label: "Title"
        name: "title"
        widget: "string"
        required: true
        hint: "e.g. President, Treasurer, Secretary"

      - label: "Sort Order"
        name: "sort_order"
        widget: "number"
        required: false
        hint: "Optional. Lower numbers appear first. Leave blank to sort alphabetically after numbered entries."

      - label: "Years Active"
        name: "years_active"
        widget: "string"
        required: false
        hint: "e.g. 2021–present"

      - label: "Photo"
        name: "photo"
        widget: "image"
        required: false

      - label: "Bio"
        name: "bio"
        widget: "text"
        required: false
```

- [ ] **Step 2: Commit**

```bash
git add admin/config.yml
git commit -m "feat: add board-members Decap CMS collection"
```

---

## Task 6: Run full test suite

- [ ] **Step 1: Run unit tests**

```bash
node --test scripts/parse-markdown.test.js
```

Expected: all tests pass.

- [ ] **Step 2: Run full build**

```bash
node scripts/build.js
```

Expected: no warnings, `[build] Done.` at the end, and `about.html` contains the generated board member card.
