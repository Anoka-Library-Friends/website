// scripts/parse-markdown.test.js
// Run with: node --test scripts/parse-markdown.test.js

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePost,
  sortByDateDesc,
  sortByStartDateAsc,
  formatDate,
  isExpired,
  paginate,
} from './parse-markdown.js';

// ── parsePost ────────────────────────────────────────────────────────────────

test('parsePost extracts title and author from front matter', () => {
  const content = `---
title: Summer Reading Recap
author: Jane Doe
date: 2026-08-01
excerpt: A great summer at the library.
---
Hello **world**.`;
  const { data, html, slug } = parsePost(content, 'summer-reading-recap.md');
  assert.equal(data.title, 'Summer Reading Recap');
  assert.equal(data.author, 'Jane Doe');
  assert.equal(slug, 'summer-reading-recap');
  assert.ok(html.includes('<strong>world</strong>'), `Expected bold markdown in html, got: ${html}`);
});

test('parsePost derives slug from filename by stripping .md', () => {
  const content = '---\ntitle: Test\n---\nBody.';
  const { slug } = parsePost(content, 'my-cool-post.md');
  assert.equal(slug, 'my-cool-post');
});

test('parsePost handles post with no front matter without throwing', () => {
  const content = 'Just a plain body with no front matter.';
  const { data, html, slug } = parsePost(content, 'plain.md');
  assert.deepEqual(data, {});
  assert.ok(html.includes('Just a plain body'));
  assert.equal(slug, 'plain');
});

// ── sortByDateDesc ────────────────────────────────────────────────────────────

test('sortByDateDesc returns newest post first', () => {
  const posts = [
    { data: { date: '2026-01-01' } },
    { data: { date: '2026-06-15' } },
    { data: { date: '2025-12-31' } },
  ];
  const sorted = sortByDateDesc(posts);
  assert.equal(sorted[0].data.date, '2026-06-15');
  assert.equal(sorted[2].data.date, '2025-12-31');
});

test('sortByDateDesc puts posts with missing date at end', () => {
  const posts = [
    { data: { date: '2026-03-01' } },
    { data: {} },
  ];
  const sorted = sortByDateDesc(posts);
  assert.equal(sorted[0].data.date, '2026-03-01');
  assert.equal(sorted[1].data.date, undefined);
});

// ── sortByStartDateAsc ────────────────────────────────────────────────────────

test('sortByStartDateAsc returns soonest opportunity first', () => {
  const items = [
    { data: { start_date: '2026-09-01' } },
    { data: { start_date: '2026-05-10' } },
  ];
  const sorted = sortByStartDateAsc(items);
  assert.equal(sorted[0].data.start_date, '2026-05-10');
});

// ── formatDate ────────────────────────────────────────────────────────────────

test('formatDate formats ISO date as readable string', () => {
  const result = formatDate('2026-04-08');
  assert.equal(result, 'April 8, 2026');
});

test('formatDate returns empty string for falsy input', () => {
  assert.equal(formatDate(null), '');
  assert.equal(formatDate(''), '');
  assert.equal(formatDate(undefined), '');
});

// ── isExpired ─────────────────────────────────────────────────────────────────

test('isExpired returns true for past end_date', () => {
  assert.ok(isExpired({ end_date: '2000-01-01' }));
});

test('isExpired returns false for future end_date', () => {
  assert.ok(!isExpired({ end_date: '2099-01-01' }));
});

test('isExpired returns false when end_date is missing', () => {
  assert.ok(!isExpired({}));
});

// ── paginate ──────────────────────────────────────────────────────────────────

test('paginate splits 11 items into pages of 10 and 1', () => {
  const items = Array.from({ length: 11 }, (_, i) => i);
  const pages = paginate(items, 10);
  assert.equal(pages.length, 2);
  assert.equal(pages[0].length, 10);
  assert.equal(pages[1].length, 1);
});

test('paginate returns one page when items fit', () => {
  const items = [1, 2, 3];
  const pages = paginate(items, 10);
  assert.equal(pages.length, 1);
  assert.deepEqual(pages[0], [1, 2, 3]);
});

test('paginate returns empty array for empty input', () => {
  assert.deepEqual(paginate([], 10), []);
});
