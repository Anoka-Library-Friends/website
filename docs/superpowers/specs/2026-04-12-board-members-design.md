# Board Members — Design Spec
**Date:** 2026-04-12

## Problem

Board members are currently hardcoded in `about.html:74–81`. Adding, removing, or updating a member requires editing HTML directly — inaccessible to non-technical volunteers.

## Goal

Make board members easy to change via the existing Decap CMS admin panel, with no HTML knowledge required.

---

## Data Model

Each board member is a separate markdown file in a new `board-members/` folder at the project root. The filename is the slug (e.g., `betsy-friesen.md`) but has no effect on display order.

### Frontmatter schema

```yaml
---
name: "Betsy Friesen"                     # required — display name
title: "President"                         # required — board role
sort_order: 1                              # optional — numeric; omit to sort after numbered entries
years_active: "2021–present"              # optional — free text
photo: "/images/uploads/betsy.webp"       # optional — CMS-uploaded image path
bio: "Betsy is the current president..."  # optional — plain text biography
---
```

The markdown body of each file is unused.

### Sort logic

1. Members with `sort_order` defined come first, sorted numerically ascending.
2. Members without `sort_order` follow, sorted alphabetically by `name`.
3. Ties within the same `sort_order` value sort alphabetically by `name`.

---

## Build Step

A new `boardMembersHtml()` function is added to `scripts/build.js`. It:

1. Reads all `.md` files from `board-members/` using the existing `readMarkdownDir()` helper.
2. Applies the sort logic above.
3. Renders each member as an HTML card matching the existing portrait layout (photo + name/title heading + optional years active + optional bio).
4. Returns the combined HTML string.

The existing hardcoded block in `about.html:74–81` is replaced with comment markers:

```html
<!-- BUILD:BOARD_MEMBERS_START -->
<!-- BUILD:BOARD_MEMBERS_END -->
```

The build step calls `injectBetweenMarkers()` — the same utility already used for blog posts, volunteer opportunities, and events.

### Card HTML structure (per member)

```html
<div style="margin-top: 1rem; display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap;">
  <!-- photo omitted if not set -->
  <img src="..." alt="Name" width="120" height="120" style="border-radius: 50%; object-fit: cover; flex-shrink: 0;">
  <div>
    <h3 style="font-size: 1.1rem;">Name — Title (years_active)</h3>
    <p>bio</p>
  </div>
</div>
```

Optional fields (`photo`, `years_active`, `bio`) are omitted from the card when absent.

---

## Decap CMS Collection

A new collection is appended to `admin/config.yml`:

```yaml
- name: "board-members"
  label: "Board Members"
  folder: "board-members"
  create: true
  slug: "{{slug}}"
  extension: "md"
  fields:
    - { label: "Name",         name: "name",         widget: "string",  required: true }
    - { label: "Title",        name: "title",        widget: "string",  required: true }
    - { label: "Sort Order",   name: "sort_order",   widget: "number",  required: false,
        hint: "Optional. Lower numbers appear first. Leave blank to sort alphabetically after numbered entries." }
    - { label: "Years Active", name: "years_active", widget: "string",  required: false,
        hint: "e.g. 2021–present" }
    - { label: "Photo",        name: "photo",        widget: "image",   required: false }
    - { label: "Bio",          name: "bio",          widget: "text",    required: false }
```

---

## Migration

The existing Betsy Friesen entry in `about.html` is migrated to `board-members/betsy-friesen.md` as part of implementation. Her portrait image at `images/board-member-portrait/betsy.webp` stays in place; the `photo` frontmatter field points to it.

---

## Files Changed

| File | Change |
|---|---|
| `board-members/betsy-friesen.md` | new — migrated from hardcoded HTML |
| `scripts/build.js` | add `boardMembersHtml()` function and build step |
| `about.html` | replace hardcoded block with comment markers |
| `admin/config.yml` | add `board-members` collection |
