# Website Redesign Design Spec
**Date:** 2026-04-12
**Project:** Friends of the Anoka County Library
**Reference sites:** thefriends.org, rclfriends.org

---

## Goal

Full visual and structural overhaul of the existing static website to match the quality and community-focus of peer Friends of the Library organizations. Scope covers all pages: global styles, homepage, and all inner pages.

---

## 1. Global Styles (`style.css`)

Replace all existing CSS custom properties with the official Anoka County brand palette and typography. Every page inherits changes automatically.

### Design Tokens

```css
/* Colors */
--color-primary:      #904026;  /* AC Burnt Umber — buttons, headings, accents */
--color-primary-dark: #6A3222;  /* Liver — hover states on primary */
--color-secondary:    #5B5248;  /* Umber — body text, secondary elements */
--color-warm:         #BC5839;  /* Crayola Brown — warm accents */
--color-teal:         #415C5C;  /* Feldgrau — nav, card section bands */
--color-teal-light:   #6F9191;  /* Desaturated Cyan — teal hover states */
--color-seaweed:      #137C7D;  /* Metallic Seaweed — links, icon accents */
--color-sky:          #CFE1E0;  /* Columbia Blue — alt section bg, placeholders */
--color-bg:           #F8F5EC;  /* Isabelline — page background */
--color-dark:         #262626;  /* Raisin Black — header, footer */
--color-text:         #422E1D;  /* Deep brown — body text */
--color-text-muted:   #6B5B4F;  /* Grullo (darkened for WCAG AA 4.5:1 on --color-bg) */
--color-border:       #ddd8d0;  /* Neutral warm border */
--color-focus:        #ECE331;  /* Yellow — high-contrast focus ring */

/* Typography */
--font-heading: 'Montserrat', Arial, sans-serif;
--font-body:    'Poppins', Arial, Helvetica, sans-serif;
--font-serif:   'Merriweather', Georgia, serif;   /* pull quotes, editorial accents */
```

### Google Fonts

Replace the existing Open Sans import with:
```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Poppins:wght@400;500;600&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
```

Add to all HTML pages (replace existing font `<link>` tags).

### Nav & Footer

- **Header background:** `--color-dark`
- **Nav links:** `--color-text-muted` (Grullo), white on hover
- **Donate nav button:** `--color-primary` background, white text
- **Footer background:** `--color-dark`, link color `--color-text-muted`
- **Footer layout:** unchanged (three columns: org info, quick links, social)

---

## 2. Homepage (`index.html`)

Four sections in order:

### 2a. Hero
- Full-width section, gradient background: `--color-teal` → `--color-dark`
- Centered content, generous vertical padding (6rem top/bottom)
- Eyebrow text: "Friends of the Anoka County Library" in `--color-sky`, Montserrat, uppercase, tight letter-spacing
- `<h1>` in Montserrat 800 weight, `--color-bg` (cream), ~3rem, line-height 1.15
- Placeholder mission statement paragraph in `--color-sky`
- Two buttons:
  - Primary: `--color-primary` bg, white text, "Become a Member" → `/membership.html`
  - Outline: 2px solid `--color-bg`, cream text, "Make a Donation" → `/donate.html`

### 2b. Upcoming Events Strip
- Background: `--color-bg` (cream)
- Section heading: "Upcoming Events" in Montserrat, `--color-primary`
- 2–3 hardcoded placeholder event rows, each with:
  - Date badge: `--color-primary` background, white text, Montserrat bold (e.g. "APR 25")
  - Event title + short description
  - Horizontal rule between items
- "See all events →" link to `/events.html` in `--color-seaweed`

### 2c. Latest News
- Background: `--color-teal`
- Section heading "Latest News" in `--color-bg`
- Existing 3-card blog grid (BUILD:RECENT_POSTS injection preserved)
- Card style update: white card bg, `--color-primary` title, `--color-text-muted` date, Montserrat card titles
- "All Posts" outline button in cream

### 2d. CTA Band
- Background: `--color-primary`
- Heading: "Join the Friends Today" in white, Montserrat 800
- Supporting paragraph in `--color-sky`
- Two cream buttons: "View Membership Tiers" → `/membership.html`, "Make a Donation" → `/donate.html`

---

## 3. Inner Pages

Every inner page gets the same treatment — no structural content changes, only visual upgrades:

### Page Hero Banner
Each inner page gets a banner directly below the nav:
- Background: `--color-dark`
- Page title centered, Montserrat 800, `--color-bg`, ~2.2rem
- Short subtitle in `--color-text-muted` (can be placeholder text)
- Padding: 3rem top/bottom

### Pages to update
| Page | Title | Subtitle |
|------|-------|----------|
| `about.html` | About & Contact | Learn about our mission, board, and how to reach us |
| `events.html` | Events & Programs | Upcoming programs, book sales, and community gatherings |
| `membership.html` | Membership | Support the library — join the Friends today |
| `volunteer.html` | Volunteer | Make a difference in your community |
| `donate.html` | Make a Donation | Your gift directly supports the Anoka County Library |
| `blog/index.html` | Latest News | Updates, stories, and announcements from the Friends |

### Body Section Styling
- Sections alternate between `--color-bg` and `--color-sky` backgrounds for visual rhythm
- All headings switch to Montserrat; body text switches to Poppins
- Link color: `--color-seaweed`

---

## 4. Floating Donate Button

A persistent donate prompt on every page **except** `donate.html`.

### Behavior
- Fixed position, bottom-right corner: `bottom: 1.5rem; right: 1.5rem`
- Present on all pages; hidden on `donate.html`
- Implementation: `main.js` checks for `data-page="donate"` on `<body>` and skips rendering if found
- `donate.html` gets `<body data-page="donate">`

### Appearance
- Pill shape: `border-radius: 50px`
- Background: `--color-primary` (#904026), white text
- Label: "Donate" with a ♥ or hand icon prefix
- Minimum size: 56px height (WCAG 2.5.5 tap target)
- `box-shadow: 0 4px 12px rgba(0,0,0,0.25)`
- Hover: scale(1.05) + `--color-primary-dark` background
- Links to `/donate.html`
- `z-index: 1000` to float above all content

### Markup (injected by `main.js` into `document.body`)
```html
<a href="/donate.html" class="donate-fab" aria-label="Donate to Friends of the Anoka County Library">
  ♥ Donate
</a>
```

---

## 5. PayPal Donate Integration (`donate.html`)

The donate page embeds a PayPal-hosted donate button — no backend or PayPal SDK required. PayPal handles all payment processing and receipts.

### How it works
The organization generates a donate button from their PayPal Business account (Merchant Services → PayPal Buttons → Donate). PayPal produces a small HTML `<form>` snippet with a hosted button ID. That snippet is pasted into `donate.html`.

### Placeholder markup
Until the real button ID is obtained from PayPal, the donate page uses a clearly-commented placeholder:

```html
<!-- PAYPAL DONATE BUTTON: Replace hosted_button_id value with your PayPal button ID.
     Generate at: paypal.com → Merchant Services → PayPal Buttons → Donate -->
<form action="https://www.paypal.com/donate" method="post" target="_top">
  <input type="hidden" name="hosted_button_id" value="REPLACE_WITH_YOUR_BUTTON_ID">
  <button type="submit" class="btn btn--primary btn--paypal">
    Donate with PayPal
  </button>
</form>
```

### CSP update (`netlify.toml`)
The PayPal form posts to `paypal.com`, so `form-action` must be added to the Content Security Policy header:
```
form-action 'self' https://www.paypal.com;
```

### Donate page layout
The donate page gets the standard inner-page hero banner, then a centered content section:
1. Impact statement — 2–3 sentences on what donations fund (placeholder copy)
2. PayPal donate button (styled to match brand but standard PayPal submit behavior)
3. Note: "You will be redirected to PayPal to complete your donation securely."
4. Tax-deductibility note placeholder (e.g. "Friends of the Anoka County Library is a 501(c)(3) nonprofit.")

The floating donate FAB does **not** appear on this page (`data-page="donate"` on `<body>`).

---

## 6. Implementation Notes

- All color and font values live exclusively in CSS custom properties in `style.css` — no hardcoded values in HTML or component styles. Changing a brand color requires editing one line.
- Placeholder images use `--color-sky` (`#CFE1E0`) as background color with a centered label. Replace with real `<picture>` elements when photos are available.
- Placeholder events are hardcoded in `index.html` with an HTML comment marking them for easy replacement.
- The `BUILD:RECENT_POSTS` injection markers in `index.html` are preserved exactly — the build script continues to work unchanged.
- No new dependencies required.

---

## Out of Scope

- Decap CMS config changes
- Netlify Identity / auth changes
- New pages
- Newsletter backend integration (markup placeholder only if added later)
- Real photos (placeholders used throughout)
- PayPal recurring donations or custom amount fields (standard donate button only)
