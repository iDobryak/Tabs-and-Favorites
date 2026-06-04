const elements = {
  includeQueryParams: document.getElementById("includeQueryParams"),
  includeHash: document.getElementById("includeHash"),
  ignoreTrailingSlash: document.getElementById("ignoreTrailingSlash"),
  protectPinnedTabs: document.getElementById("protectPinnedTabs"),

  rescanButton: document.getElementById("rescanButton"),
  closeAllDuplicatesButton: document.getElementById("closeAllDuplicatesButton"),
  sortCurrentWindowButton: document.getElementById("sortCurrentWindowButton"),
  sortAllWindowsButton: document.getElementById("sortAllWindowsButton"),
  groupSitesToWindowsButton: document.getElementById("groupSitesToWindowsButton"),

  status: document.getElementById("status"),
  sites: document.getElementById("sites")
};

let state = {
  tabs: [],
  siteGroups: []
};

document.addEventListener("DOMContentLoaded", async () => {
  bindEvents();
  await loadSettings();
  await scanAndRender();
});

function bindEvents() {
  elements.rescanButton.addEventListener("click", scanAndRender);
  elements.closeAllDuplicatesButton.addEventListener("click", closeAllDuplicates);
  elements.sortCurrentWindowButton.addEventListener("click", sortTabsInCurrentWindow);
  elements.sortAllWindowsButton.addEventListener("click", sortTabsInAllWindows);
  elements.groupSitesToWindowsButton.addEventListener("click", moveSitesToSeparateWindows);

  [
    elements.includeQueryParams,
    elements.includeHash,
    elements.ignoreTrailingSlash,
    elements.protectPinnedTabs
  ].forEach((checkbox) => {
    checkbox.addEventListener("change", async () => {
      await saveSettings();
      await scanAndRender();
    });
  });
}

async function loadSettings() {
  const settings = await chrome.storage.local.get([
    "includeQueryParams",
    "includeHash",
    "ignoreTrailingSlash",
    "protectPinnedTabs"
  ]);

  elements.includeQueryParams.checked = settings.includeQueryParams ?? true;
  elements.includeHash.checked = settings.includeHash ?? false;
  elements.ignoreTrailingSlash.checked = settings.ignoreTrailingSlash ?? true;
  elements.protectPinnedTabs.checked = settings.protectPinnedTabs ?? true;
}

async function saveSettings() {
  await chrome.storage.local.set(getOptions());
}

function getOptions() {
  return {
    includeQueryParams: elements.includeQueryParams.checked,
    includeHash: elements.includeHash.checked,
    ignoreTrailingSlash: elements.ignoreTrailingSlash.checked,
    protectPinnedTabs: elements.protectPinnedTabs.checked
  };
}

async function scanAndRender() {
  await scanAndRenderWithStatus();
}

async function scanAndRenderWithStatus(statusPrefix = "") {
  elements.status.textContent = "Сканирую вкладки...";
  elements.sites.innerHTML = "";
  const options = getOptions();

  const tabs = await chrome.tabs.query({});

  state.tabs = tabs
    .filter((tab) => Boolean(tab.url))
    .filter((tab) => isSupportedUrl(tab.url));

  state.siteGroups = buildSiteGroups(state.tabs, options);

  render();

  const duplicateCount = getDuplicateTabIds(state.siteGroups, options).length;

  const summary =
    `Открыто вкладок: ${state.tabs.length}. ` +
    `Сайтов: ${state.siteGroups.length}. ` +
    `Дубликатов к удалению: ${duplicateCount}.`;

  elements.status.textContent = statusPrefix
    ? `${statusPrefix} ${summary}`
    : summary;
}

function isSupportedUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

function buildSiteGroups(tabs, options) {
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
      urlGroups: Array.from(siteGroup.urlGroupsMap.values())
        .sort((a, b) => a.normalizedUrl.localeCompare(b.normalizedUrl))
    }))
    .sort((a, b) => a.site.localeCompare(b.site));
}

function getSiteKey(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function normalizeUrl(url, options) {
  try {
    const parsedUrl = new URL(url);

    parsedUrl.hostname = parsedUrl.hostname.replace(/^www\./, "");

    if (!options.includeQueryParams) {
      parsedUrl.search = "";
    } else {
      parsedUrl.searchParams.sort();
    }

    if (!options.includeHash) {
      parsedUrl.hash = "";
    }

    if (options.ignoreTrailingSlash && parsedUrl.pathname.length > 1) {
      parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/, "");
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}

function render() {
  elements.sites.innerHTML = "";
  const options = getOptions();

  if (state.siteGroups.length === 0) {
    elements.sites.textContent = "Нет доступных вкладок для анализа.";
    return;
  }

  for (const siteGroup of state.siteGroups) {
    const siteElement = document.createElement("section");
    siteElement.className = "site";

    const duplicateIdsForSite = getDuplicateTabIds([siteGroup], options);

    const header = document.createElement("div");
    header.className = "site-header";

    const titleWrapper = document.createElement("div");

    const title = document.createElement("div");
    title.className = "site-title";
    title.textContent = siteGroup.site;

    const meta = document.createElement("div");
    meta.className = "site-meta";
    meta.textContent =
      `Вкладок: ${siteGroup.totalTabs}. ` +
      `URL-групп: ${siteGroup.urlGroups.length}. ` +
      `Дублей: ${duplicateIdsForSite.length}.`;

    titleWrapper.appendChild(title);
    titleWrapper.appendChild(meta);

    const closeSiteDuplicatesButton = document.createElement("button");
    closeSiteDuplicatesButton.textContent = "Удалить дубли сайта";
    closeSiteDuplicatesButton.disabled = duplicateIdsForSite.length === 0;
    closeSiteDuplicatesButton.addEventListener("click", async () => {
      if (!confirmBulkAction(`Удалить ${duplicateIdsForSite.length} дублей сайта ${siteGroup.site}?`)) {
        return;
      }

      await closeDuplicateTabsByIds(duplicateIdsForSite);
    });

    header.appendChild(titleWrapper);
    header.appendChild(closeSiteDuplicatesButton);

    siteElement.appendChild(header);

    for (const urlGroup of siteGroup.urlGroups) {
      const urlGroupElement = document.createElement("div");
      urlGroupElement.className = "url-group";

      const urlTitle = document.createElement("div");
      urlTitle.className = "url-title";
      urlTitle.textContent = urlGroup.normalizedUrl;

      urlGroupElement.appendChild(urlTitle);

      const tabsSorted = sortTabsByWindowAndIndex(urlGroup.tabs);

      tabsSorted.forEach((tab, index) => {
        const tabElement = document.createElement("div");
        tabElement.className = "tab";

        const shouldBeDuplicate = index > 0;

        const tabTitle = document.createElement("div");
        tabTitle.className = "tab-title";
        tabTitle.textContent = tab.title || "Без названия";

        const badges = document.createElement("div");

        const windowBadge = document.createElement("span");
        windowBadge.className = "badge";
        windowBadge.textContent = `Окно ${tab.windowId}`;
        badges.appendChild(windowBadge);

        if (shouldBeDuplicate) {
          const duplicateBadge = document.createElement("span");
          duplicateBadge.className = "badge duplicate";
          duplicateBadge.textContent = "дубль";
          badges.appendChild(duplicateBadge);
        }

        if (tab.pinned) {
          const pinnedBadge = document.createElement("span");
          pinnedBadge.className = "badge pinned";
          pinnedBadge.textContent = "pinned";
          badges.appendChild(pinnedBadge);
        }

        tabElement.appendChild(tabTitle);
        tabElement.appendChild(badges);

        urlGroupElement.appendChild(tabElement);
      });

      siteElement.appendChild(urlGroupElement);
    }

    elements.sites.appendChild(siteElement);
  }
}

function sortTabsByWindowAndIndex(tabs) {
  return [...tabs].sort((a, b) => {
    if (a.windowId !== b.windowId) return a.windowId - b.windowId;
    return a.index - b.index;
  });
}

function getDuplicateTabIds(siteGroups, options) {
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

async function closeAllDuplicates() {
  const duplicateTabIds = getDuplicateTabIds(state.siteGroups, getOptions());

  if (duplicateTabIds.length === 0) {
    elements.status.textContent = "Дубликаты для удаления не найдены.";
    return;
  }

  if (!confirmBulkAction(`Удалить ${duplicateTabIds.length} вкладок-дубликатов?`)) {
    return;
  }

  await closeDuplicateTabsByIds(duplicateTabIds);
}

async function closeDuplicateTabsByIds(tabIds) {
  if (tabIds.length === 0) {
    elements.status.textContent = "Дубликаты для удаления не найдены.";
    return;
  }

  const result = await removeTabsByIds(tabIds);
  const statusMessage = formatOperationStatus("Удаление дублей", result);
  await scanAndRenderWithStatus(statusMessage);
}

async function sortTabsInCurrentWindow() {
  const currentWindow = await chrome.windows.getCurrent();
  const options = getOptions();

  const tabs = prepareTabsForSorting(
    state.tabs.filter((tab) => tab.windowId === currentWindow.id),
    options
  ).sort(compareTabsForSorting);

  const result = await moveTabsInsideWindow(tabs, currentWindow.id);
  const statusMessage = formatOperationStatus("Сортировка текущего окна", result);
  await scanAndRenderWithStatus(statusMessage);
}

async function sortTabsInAllWindows() {
  const tabsByWindow = groupTabsByWindow(state.tabs);
  const result = createOperationResult();
  const options = getOptions();

  for (const [windowId, tabs] of tabsByWindow.entries()) {
    const sortedTabs = prepareTabsForSorting(tabs, options).sort(compareTabsForSorting);
    mergeOperationResult(result, await moveTabsInsideWindow(sortedTabs, Number(windowId)));
  }

  const statusMessage = formatOperationStatus("Сортировка всех окон", result);
  await scanAndRenderWithStatus(statusMessage);
}

function compareTabsForSorting(a, b) {
  if (a.sortSiteKey !== b.sortSiteKey) {
    return a.sortSiteKey.localeCompare(b.sortSiteKey);
  }

  if (a.sortNormalizedUrl !== b.sortNormalizedUrl) {
    return a.sortNormalizedUrl.localeCompare(b.sortNormalizedUrl);
  }

  return a.sortTitle.localeCompare(b.sortTitle);
}

function groupTabsByWindow(tabs) {
  const map = new Map();

  for (const tab of tabs) {
    if (!map.has(tab.windowId)) {
      map.set(tab.windowId, []);
    }

    map.get(tab.windowId).push(tab);
  }

  return map;
}

async function moveTabsInsideWindow(sortedTabs, windowId) {
  const result = createOperationResult();
  const pinnedTabsCount = sortedTabs.filter((tab) => tab.pinned).length;
  const movableTabs = sortedTabs.filter((tab) => !tab.pinned);

  for (let i = 0; i < movableTabs.length; i++) {
    try {
      await chrome.tabs.move(movableTabs[i].id, {
        windowId,
        index: pinnedTabsCount + i
      });
      result.succeeded++;
    } catch {
      result.failed++;
    }
  }

  return result;
}

async function moveSitesToSeparateWindows() {
  const result = createOperationResult();
  const options = getOptions();
  const movableTabsCount = state.siteGroups
    .flatMap((siteGroup) => siteGroup.urlGroups)
    .flatMap((urlGroup) => urlGroup.tabs)
    .filter((tab) => !options.protectPinnedTabs || !tab.pinned)
    .length;

  if (movableTabsCount === 0) {
    elements.status.textContent = "Нет вкладок для разнесения по окнам.";
    return;
  }

  if (!confirmBulkAction(`Разнести по окнам ${movableTabsCount} вкладок?`)) {
    return;
  }

  for (const siteGroup of state.siteGroups) {
    const tabs = prepareTabsForSorting(
      siteGroup.urlGroups
        .flatMap((urlGroup) => urlGroup.tabs)
        .filter((tab) => !options.protectPinnedTabs || !tab.pinned),
      options
    ).sort(compareTabsForSorting);

    if (tabs.length === 0) continue;

    const tabIds = tabs.map((tab) => tab.id);

    let newWindowId;

    try {
      const newWindow = await chrome.windows.create({
        tabId: tabIds[0]
      });
      newWindowId = newWindow.id;
      result.succeeded++;
    } catch {
      result.failed += tabIds.length;
      continue;
    }

    for (let i = 1; i < tabIds.length; i++) {
      try {
        await chrome.tabs.move(tabIds[i], {
          windowId: newWindowId,
          index: i
        });
        result.succeeded++;
      } catch {
        result.failed++;
      }
    }
  }

  const statusMessage = formatOperationStatus("Разнесение сайтов по окнам", result);
  await scanAndRenderWithStatus(statusMessage);
}

function createOperationResult() {
  return {
    succeeded: 0,
    failed: 0
  };
}

function prepareTabsForSorting(tabs, options) {
  return tabs.map((tab) => ({
    ...tab,
    sortSiteKey: getSiteKey(tab.url) || "",
    sortNormalizedUrl: normalizeUrl(tab.url, options) || "",
    sortTitle: tab.title || ""
  }));
}

function mergeOperationResult(target, source) {
  target.succeeded += source.succeeded;
  target.failed += source.failed;
}

async function removeTabsByIds(tabIds) {
  const result = createOperationResult();

  for (const tabId of tabIds) {
    try {
      await chrome.tabs.remove(tabId);
      result.succeeded++;
    } catch {
      result.failed++;
    }
  }

  return result;
}

function formatOperationStatus(actionLabel, result) {
  if (result.failed === 0) {
    return `${actionLabel}: успешно обработано ${result.succeeded}.`;
  }

  if (result.succeeded === 0) {
    return `${actionLabel}: не удалось выполнить операцию.`;
  }

  return `${actionLabel}: успешно обработано ${result.succeeded}, ошибок ${result.failed}.`;
}

function confirmBulkAction(message) {
  return window.confirm(message);
}
