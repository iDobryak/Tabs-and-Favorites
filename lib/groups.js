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
      const tabsSorted = sortTabsByWindowAndIndex(urlGroup.tabs);
      const duplicateTabs = tabsSorted.slice(1);

      for (const tab of duplicateTabs) {
        if (options.protectPinnedTabs && tab.pinned) continue;
        ids.push(tab.id);
      }
    }
  }

  return ids;
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
