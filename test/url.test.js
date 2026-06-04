import test from 'node:test';
import assert from 'node:assert/strict';

import { getSiteKey, isSupportedUrl, normalizeUrl } from '../lib/url.js';

test('isSupportedUrl allows only http and https', () => {
  assert.equal(isSupportedUrl('https://example.com/path'), true);
  assert.equal(isSupportedUrl('http://example.com/path'), true);
  assert.equal(isSupportedUrl('file:///tmp/demo.txt'), false);
  assert.equal(isSupportedUrl('chrome://extensions'), false);
});

test('getSiteKey strips leading www', () => {
  assert.equal(getSiteKey('https://www.example.com/page'), 'example.com');
  assert.equal(getSiteKey('https://docs.example.com/page'), 'docs.example.com');
});

test('normalizeUrl removes search and hash when disabled', () => {
  const normalized = normalizeUrl(
    'https://www.example.com/path/?b=2&a=1#hash',
    {
      includeQueryParams: false,
      includeHash: false,
      ignoreTrailingSlash: true,
      protectPinnedTabs: true
    }
  );

  assert.equal(normalized, 'https://example.com/path');
});

test('normalizeUrl sorts query params when query is enabled', () => {
  const normalized = normalizeUrl('https://example.com/path?b=2&a=1', {
    includeQueryParams: true,
    includeHash: false,
    ignoreTrailingSlash: true,
    protectPinnedTabs: true
  });

  assert.equal(normalized, 'https://example.com/path?a=1&b=2');
});
