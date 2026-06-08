import { getSiteKey, normalizeUrl } from './url.js';

export function buildSiteGroups(tabs, options) {
  const sitesMap = new Map();

  for (const tab of tabs) {
    const siteKey = getSiteKey(tab.url);
    const normalizedUrl = normalizeUrl(tab.url, options);

    if (!siteKey || !normalizedUrl) continue;

    if (!sitesMap.has(siteKey)) {
      sitesMap.set(siteKey, {
        site: siteKey,
        totalTabs: 0,
        urlGroupsMap: new Map()
      });
    }

    const siteGroup = sitesMap.get(siteKey);
    siteGroup.totalTabs++;

    if (!siteGroup.urlGroupsMap.has(normalizedUrl)) {
      siteGroup.urlGroupsMap.set(normalizedUrl, {
        normalizedUrl,
        tabs: []
      });
    }

    siteGroup.urlGroupsMap.get(normalizedUrl).tabs.push(tab);
  }

  return Array.from(sitesMap.values())
    .map((siteGroup) => ({
      site: siteGroup.site,
      totalTabs: siteGroup.totalTabs,
      urlGroups: Array.from(siteGroup.urlGroupsMap.values()).sort((a, b) =>
        a.normalizedUrl.localeCompare(b.normalizedUrl)
      )
    }))
    .sort((a, b) => a.site.localeCompare(b.site));
}

export function sortTabsByWindowAndIndex(tabs) {
  return [...tabs].sort((a, b) => {
    if (a.windowId !== b.windowId) return a.windowId - b.windowId;
    return a.index - b.index;
  });
}

export function getDuplicateTabIds(siteGroups, options) {
  const ids = [];

  for (const siteGroup of siteGroups) {
    for (const urlGroup of siteGroup.urlGroups) {
      const duplicateTabs = getDuplicateTabsForUrlGroup(urlGroup, options);

      for (const tab of duplicateTabs) {
        ids.push(tab.id);
      }
    }
  }

  return ids;
}

export function getDuplicateTabsForUrlGroup(urlGroup, options) {
  const tabsSorted = sortTabsByWindowAndIndex(urlGroup.tabs);

  if (tabsSorted.length < 2) {
    return [];
  }

  const protectedTabs = tabsSorted.filter((tab) =>
    isProtectedFromDuplicateRemoval(tab, options)
  );

  if (protectedTabs.length > 0) {
    return tabsSorted.filter((tab) =>
      canRemoveDuplicateTab(tab, options)
    );
  }

  const [tabToKeep] = [...tabsSorted].sort(compareTabsForDuplicateRetention);

  return tabsSorted.filter(
    (tab) => tab.id !== tabToKeep.id && canRemoveDuplicateTab(tab, options)
  );
}

export function siteHasDuplicateUrls(siteGroup) {
  return siteGroup.urlGroups.some((urlGroup) => urlGroup.tabs.length > 1);
}

export function groupTabsByWindow(tabs) {
  const map = new Map();

  for (const tab of tabs) {
    if (!map.has(tab.windowId)) {
      map.set(tab.windowId, []);
    }

    map.get(tab.windowId).push(tab);
  }

  return map;
}

export function prepareTabsForSorting(tabs, options) {
  return tabs.map((tab) => ({
    ...tab,
    sortSiteKey: getSiteKey(tab.url) || '',
    sortNormalizedUrl: normalizeUrl(tab.url, options) || '',
    sortTitle: tab.title || ''
  }));
}

export function compareTabsForSorting(a, b) {
  if (a.sortSiteKey !== b.sortSiteKey) {
    return a.sortSiteKey.localeCompare(b.sortSiteKey);
  }

  if (a.sortNormalizedUrl !== b.sortNormalizedUrl) {
    return a.sortNormalizedUrl.localeCompare(b.sortNormalizedUrl);
  }

  return a.sortTitle.localeCompare(b.sortTitle);
}

export function isTabInGroup(tab) {
  return Number.isInteger(tab.groupId) && tab.groupId >= 0;
}

function canRemoveDuplicateTab(tab, options) {
  if (options.protectPinnedTabs && tab.pinned) {
    return false;
  }

  if (!options.allowGroupedDuplicateRemoval && isTabInGroup(tab)) {
    return false;
  }

  return true;
}

function isProtectedFromDuplicateRemoval(tab, options) {
  if (options.protectPinnedTabs && tab.pinned) {
    return true;
  }

  if (!options.allowGroupedDuplicateRemoval && isTabInGroup(tab)) {
    return true;
  }

  return false;
}

function compareTabsForDuplicateRetention(a, b) {
  const groupPriorityDifference = Number(isTabInGroup(b)) - Number(isTabInGroup(a));

  if (groupPriorityDifference !== 0) {
    return groupPriorityDifference;
  }

  if (a.pinned !== b.pinned) {
    return Number(b.pinned) - Number(a.pinned);
  }

  if (a.windowId !== b.windowId) {
    return a.windowId - b.windowId;
  }

  return a.index - b.index;
}
