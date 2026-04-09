// scripts/parse-markdown.js
// Pure functions for parsing Markdown front matter and converting body to HTML.
// No side effects — all I/O lives in build.js.

import matter from 'gray-matter';
import { marked } from 'marked';

/**
 * Parse a Markdown file string into { data, html, slug }.
 * @param {string} fileContent - Raw file content including YAML front matter.
 * @param {string} filename    - Filename (e.g. "summer-reading-recap.md") used to derive slug.
 * @returns {{ data: object, html: string, slug: string }}
 */
export function parsePost(fileContent, filename) {
  const { data, content } = matter(fileContent);
  const html = marked.parse(content);
  const slug = filename.replace(/\.md$/, '');
  return { data, html, slug };
}

/**
 * Sort an array of parsed posts newest-first by data.date.
 * Items with missing or invalid dates sort to the end.
 * @param {Array<{ data: { date: string|Date } }>} posts
 * @returns {Array}
 */
export function sortByDateDesc(posts) {
  return [...posts].sort((a, b) => {
    const da = a.data.date ? new Date(a.data.date) : new Date(0);
    const db = b.data.date ? new Date(b.data.date) : new Date(0);
    return db - da;
  });
}

/**
 * Sort volunteer opportunities by start_date ascending (soonest first).
 * Items with missing dates sort to the end.
 * @param {Array<{ data: { start_date: string|Date } }>} items
 * @returns {Array}
 */
export function sortByStartDateAsc(items) {
  return [...items].sort((a, b) => {
    const da = a.data.start_date ? new Date(a.data.start_date) : new Date(8640000000000000);
    const db = b.data.start_date ? new Date(b.data.start_date) : new Date(8640000000000000);
    return da - db;
  });
}

/**
 * Format a date value as a human-readable string (e.g. "April 8, 2026").
 * Returns empty string for falsy input.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Return true if the opportunity's end_date is in the past (expired).
 * @param {{ end_date: string|Date }} data
 * @returns {boolean}
 */
export function isExpired(data) {
  if (!data.end_date) return false;
  return new Date(data.end_date) < new Date();
}

/**
 * Paginate an array into chunks of `pageSize`.
 * @param {Array} items
 * @param {number} pageSize
 * @returns {Array<Array>}  Array of pages; each page is an array of items.
 */
export function paginate(items, pageSize) {
  const pages = [];
  for (let i = 0; i < items.length; i += pageSize) {
    pages.push(items.slice(i, i + pageSize));
  }
  return pages;
}
