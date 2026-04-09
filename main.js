// main.js — shared navigation behavior
// Runs on every page via defer attribute on <script> tag.

(function () {
  'use strict';

  // ── Hamburger menu toggle ────────────────────────────────────────────────
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.querySelector('.nav-links');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      const isOpen = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!isOpen));
      menu.classList.toggle('is-open', !isOpen);
    });

    // Close menu when a nav link is clicked (mobile UX)
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
        toggle.focus();
      }
    });
  }

  // ── Active nav link highlighting ─────────────────────────────────────────
  // Match the current page URL against nav link hrefs.
  // Uses aria-current="page" (read by screen readers) + CSS targets that attr.
  const currentPath = window.location.pathname;

  document.querySelectorAll('.nav-links a').forEach(function (link) {
    const linkPath = new URL(link.href, window.location.origin).pathname;

    // Exact match, or blog sub-pages matching /blog/
    const isActive =
      linkPath === currentPath ||
      (linkPath === '/blog/' && currentPath.startsWith('/blog/'));

    if (isActive) {
      link.setAttribute('aria-current', 'page');
    }
  });
}());
