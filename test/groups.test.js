import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildSiteGroups,
  getDuplicateTabIds,
  groupTabsByWindow,
  prepareTabsForSorting
} from '../lib/groups.js';

const options = {
  includeQueryParams: false,
  includeHash: false,
  ignoreTrailingSlash: true,
  protectPinnedTabs: true
};

test('buildSiteGroups groups tabs by site and normalized url', () => {
  const tabs = [
    {
      id: 1,
      url: 'https://www.example.com/path?a=1',
      windowId: 1,
      index: 0,
      title: 'A'
    },
    {
      id: 2,
      url: 'https://example.com/path?a=2',
      windowId: 1,
      index: 1,
      title: 'B'
    },
    {
      id: 3,
      url: 'https://docs.example.com/guide',
      windowId: 2,
      index: 0,
      title: 'C'
    }
  ];

  const siteGroups = buildSiteGroups(tabs, options);

  assert.equal(siteGroups.length, 2);
  assert.equal(siteGroups[0].site, 'docs.example.com');
  assert.equal(siteGroups[1].site, 'example.com');
  assert.equal(siteGroups[1].urlGroups.length, 1);
  assert.equal(siteGroups[1].urlGroups[0].tabs.length, 2);
});

test('getDuplicateTabIds skips pinned duplicates when protection is enabled', () => {
  const siteGroups = [
    {
      site: 'example.com',
      totalTabs: 3,
      urlGroups: [
        {
          normalizedUrl: 'https://example.com/path',
          tabs: [
            { id: 1, windowId: 1, index: 0, pinned: false },
            { id: 2, windowId: 1, index: 1, pinned: true },
            { id: 3, windowId: 1, index: 2, pinned: false }
          ]
        }
      ]
    }
  ];

  assert.deepEqual(getDuplicateTabIds(siteGroups, options), [3]);
});

test('groupTabsByWindow collects tabs by windowId', () => {
  const tabs = [
    { id: 1, windowId: 1 },
    { id: 2, windowId: 1 },
    { id: 3, windowId: 2 }
  ];

  const grouped = groupTabsByWindow(tabs);

  assert.equal(grouped.get(1).length, 2);
  assert.equal(grouped.get(2).length, 1);
});

test('prepareTabsForSorting computes stable sort fields', () => {
  const [preparedTab] = prepareTabsForSorting(
    [
      {
        id: 1,
        url: 'https://www.example.com/path?b=2&a=1',
        title: 'Title'
      }
    ],
    {
      ...options,
      includeQueryParams: true
    }
  );

  assert.equal(preparedTab.sortSiteKey, 'example.com');
  assert.equal(
    preparedTab.sortNormalizedUrl,
    'https://example.com/path?a=1&b=2'
  );
  assert.equal(preparedTab.sortTitle, 'Title');
});
