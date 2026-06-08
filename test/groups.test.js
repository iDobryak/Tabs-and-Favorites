import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildSiteGroups,
  getDuplicateTabIds,
  getDuplicateTabsForUrlGroup,
  groupTabsByWindow,
  siteHasDuplicateUrls,
  prepareTabsForSorting
} from '../lib/groups.js';
import { buildWindowSortPlan, buildWindowTabGroups } from '../lib/tabActions.js';

const options = {
  includeQueryParams: false,
  includeHash: false,
  ignoreTrailingSlash: true,
  protectPinnedTabs: true,
  showOnlyDuplicateSites: false,
  allowGroupedDuplicateRemoval: false
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

test('getDuplicateTabIds keeps pinned duplicate and removes remaining removable copies', () => {
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

  assert.deepEqual(getDuplicateTabIds(siteGroups, options), [1, 3]);
});

test('getDuplicateTabsForUrlGroup prefers keeping grouped tab over ungrouped duplicate', () => {
  const urlGroup = {
    normalizedUrl: 'https://example.com/path',
    tabs: [
      { id: 1, windowId: 1, index: 0, pinned: false, groupId: 2 },
      { id: 2, windowId: 1, index: 1, pinned: false, groupId: -1 }
    ]
  };

  assert.deepEqual(
    getDuplicateTabsForUrlGroup(urlGroup, options).map((tab) => tab.id),
    [2]
  );
});

test('getDuplicateTabsForUrlGroup keeps grouped duplicates when grouped removal is disabled', () => {
  const urlGroup = {
    normalizedUrl: 'https://example.com/path',
    tabs: [
      { id: 1, windowId: 1, index: 0, pinned: false, groupId: 5 },
      { id: 2, windowId: 1, index: 1, pinned: false, groupId: 5 }
    ]
  };

  assert.deepEqual(
    getDuplicateTabsForUrlGroup(urlGroup, options).map((tab) => tab.id),
    []
  );
});

test('getDuplicateTabsForUrlGroup can remove grouped duplicates when option is enabled', () => {
  const urlGroup = {
    normalizedUrl: 'https://example.com/path',
    tabs: [
      { id: 1, windowId: 1, index: 0, pinned: false, groupId: 5 },
      { id: 2, windowId: 1, index: 1, pinned: false, groupId: 5 }
    ]
  };

  assert.deepEqual(
    getDuplicateTabsForUrlGroup(urlGroup, {
      ...options,
      allowGroupedDuplicateRemoval: true
    }).map((tab) => tab.id),
    [2]
  );
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

test('siteHasDuplicateUrls returns true only for sites with repeated urls', () => {
  assert.equal(
    siteHasDuplicateUrls({
      site: 'example.com',
      totalTabs: 2,
      urlGroups: [
        { normalizedUrl: 'https://example.com/a', tabs: [{ id: 1 }, { id: 2 }] }
      ]
    }),
    true
  );
  assert.equal(
    siteHasDuplicateUrls({
      site: 'example.com',
      totalTabs: 2,
      urlGroups: [
        { normalizedUrl: 'https://example.com/a', tabs: [{ id: 1 }] },
        { normalizedUrl: 'https://example.com/b', tabs: [{ id: 2 }] }
      ]
    }),
    false
  );
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

test('buildWindowTabGroups keeps oversized site in its own window', () => {
  const siteGroups = [
    {
      site: 'alpha.example',
      totalTabs: 21,
      urlGroups: [
        {
          normalizedUrl: 'https://alpha.example',
          tabs: Array.from({ length: 21 }, (_, index) => ({
            id: index + 1,
            url: `https://alpha.example/${index + 1}`,
            title: `Alpha ${index + 1}`,
            pinned: false
          }))
        }
      ]
    }
  ];

  const windowTabGroups = buildWindowTabGroups(siteGroups, {
    ...options,
    tabsPerWindowLimit: 20
  });

  assert.equal(windowTabGroups.length, 1);
  assert.equal(windowTabGroups[0].length, 21);
});

test('buildWindowTabGroups accumulates sites by display order until limit', () => {
  const siteGroups = [
    createSiteGroup('alpha.example', 10, 1),
    createSiteGroup('beta.example', 4, 11),
    createSiteGroup('gamma.example', 5, 15),
    createSiteGroup('delta.example', 2, 20)
  ];

  const windowTabGroups = buildWindowTabGroups(siteGroups, {
    ...options,
    tabsPerWindowLimit: 20
  });

  assert.equal(windowTabGroups.length, 2);
  assert.deepEqual(
    windowTabGroups.map((tabs) => tabs.length),
    [19, 2]
  );
  assert.deepEqual(
    windowTabGroups[0].map((tab) => getSiteFromUrl(tab.url)),
    [
      ...Array.from({ length: 10 }, () => 'alpha.example'),
      ...Array.from({ length: 4 }, () => 'beta.example'),
      ...Array.from({ length: 5 }, () => 'gamma.example')
    ]
  );
  assert.deepEqual(
    windowTabGroups[1].map((tab) => getSiteFromUrl(tab.url)),
    ['delta.example', 'delta.example']
  );
});

test('buildWindowSortPlan leaves grouped tabs fixed and sorts only ungrouped tabs', () => {
  const sortPlan = buildWindowSortPlan(
    [
      {
        id: 1,
        windowId: 1,
        index: 0,
        pinned: false,
        groupId: -1,
        url: 'https://zeta.example',
        title: 'Zeta'
      },
      {
        id: 2,
        windowId: 1,
        index: 1,
        pinned: false,
        groupId: 7,
        url: 'https://beta.example',
        title: 'Beta'
      },
      {
        id: 3,
        windowId: 1,
        index: 2,
        pinned: false,
        groupId: 7,
        url: 'https://alpha.example',
        title: 'Alpha'
      },
      {
        id: 4,
        windowId: 1,
        index: 3,
        pinned: false,
        groupId: -1,
        url: 'https://gamma.example',
        title: 'Gamma'
      }
    ],
    options
  );

  assert.deepEqual(
    sortPlan.movableTabs.map((tab) => tab.id),
    [4, 1]
  );
  assert.deepEqual(sortPlan.targetIndexes, [0, 3]);
});

function createSiteGroup(site, tabsCount, startId) {
  return {
    site,
    totalTabs: tabsCount,
    urlGroups: [
      {
        normalizedUrl: `https://${site}`,
        tabs: Array.from({ length: tabsCount }, (_, index) => ({
          id: startId + index,
          url: `https://${site}/${index + 1}`,
          title: `${site} ${index + 1}`,
          pinned: false
        }))
      }
    ]
  };
}

function getSiteFromUrl(url) {
  return new URL(url).hostname;
}
