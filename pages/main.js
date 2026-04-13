// main.js — shared navigation behavior
// Runs on every page via defer attribute on <script> tag.

(function () {
  'use strict';

  // ── Hamburger menu toggle ────────────────────────────────────────────────
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.querySelector('.nav-links');

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
  }

  // ── Active nav link highlighting ─────────────────────────────────────────
  // Match the current page URL against nav link hrefs.
  // Uses aria-current="page" (read by screen readers) + CSS targets that attr.
  const currentPath = window.location.pathname;

  // Normalize: strip .html and trailing slash (except root)
  function normalizePath(p) {
    return p.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  }

  document.querySelectorAll('.nav-links a').forEach(function (link) {
    const linkPath = new URL(link.href, window.location.origin).pathname;

    const isActive =
      normalizePath(linkPath) === normalizePath(currentPath) ||
      (normalizePath(linkPath) === '/blog' && normalizePath(currentPath).startsWith('/blog'));

    if (isActive) {
      link.setAttribute('aria-current', 'page');
    }
  });

  // ── Footer year ───────────────────────────────────────────────────────────
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ── Floating Donate Button ────────────────────────────────────────────────
  // Suppressed on donate.html via data-page="donate" on <body>.
  if (document.body.dataset.page !== 'donate') {
    const fab = document.createElement('a');
    fab.href = '/donate.html';
    fab.className = 'donate-fab';
    fab.setAttribute('aria-label', 'Donate to Friends of the Anoka County Library');
    fab.textContent = '♥ Donate';
    document.body.appendChild(fab);
  }
}());
