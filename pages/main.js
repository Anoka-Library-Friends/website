// main.js — shared navigation behavior
// Runs on every page via defer attribute on <script> tag.

(function () {
  'use strict';

  // ── Hamburger menu toggle ────────────────────────────────────────────────
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.querySelector('.nav-menu');

  if (toggle && menu) {
    function openMenu() {
      menu.style.maxHeight = menu.scrollHeight + 'px';
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      menu.style.maxHeight = menu.scrollHeight + 'px';
      // Force reflow so transition fires from exact current height
      menu.offsetHeight; // eslint-disable-line no-unused-expressions
      menu.style.maxHeight = '0';
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      if (this.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close menu when a nav link is clicked (mobile UX)
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
    });

    // Close menu when clicking outside of it (mobile UX)
    document.addEventListener('click', function (e) {
      if (!menu.classList.contains('is-open')) return;
      if (menu.contains(e.target) || toggle.contains(e.target)) return;
      closeMenu();
    });

    // Close menu when the page scrolls (mobile UX)
    window.addEventListener('scroll', function () {
      if (menu.classList.contains('is-open')) closeMenu();
    }, { passive: true });
  }

  // ── Active nav link highlighting ─────────────────────────────────────────
  // Match the current page URL against nav link hrefs.
  // Uses aria-current="page" (read by screen readers) + CSS targets that attr.
  const currentPath = window.location.pathname;

  // Normalize: strip .html and trailing slash (except root)
  function normalizePath(p) {
    return p.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  }

  document.querySelectorAll('.nav-menu a').forEach(function (link) {
    const linkPath = new URL(link.href, window.location.origin).pathname;

    const isActive =
      normalizePath(linkPath) === normalizePath(currentPath) ||
      (normalizePath(linkPath) === '/news' && normalizePath(currentPath).startsWith('/news'));

    if (isActive) {
      link.setAttribute('aria-current', 'page');
    }
  });

  // ── Footer year ───────────────────────────────────────────────────────────
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ── Board Members heading year ────────────────────────────────────────────
  const boardYearEl = document.getElementById('board-year');
  if (boardYearEl) {
    boardYearEl.textContent = new Date().getFullYear();
  }

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
}());
