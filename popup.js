import {
  buildSiteGroups,
  getDuplicateTabIds,
  siteHasDuplicateUrls
} from './lib/groups.js';
import {
  activateTab,
  buildWindowTabGroups,
  closeSiteTabsByIds,
  closeTabById,
  closeDuplicateTabsByIds,
  moveSitesToSeparateWindows,
  sortTabsInAllWindows,
  sortTabsInCurrentWindow
} from './lib/tabActions.js';
import { loadSettings, saveSettings, getOptions } from './lib/settings.js';
import { renderSiteGroups } from './lib/ui.js';
import { isSupportedUrl } from './lib/url.js';

const elements = {
  includeQueryParams: document.getElementById('includeQueryParams'),
  includeHash: document.getElementById('includeHash'),
  ignoreTrailingSlash: document.getElementById('ignoreTrailingSlash'),
  protectPinnedTabs: document.getElementById('protectPinnedTabs'),
  showOnlyDuplicateSites: document.getElementById('showOnlyDuplicateSites'),
  allowGroupedDuplicateRemoval: document.getElementById(
    'allowGroupedDuplicateRemoval'
  ),
  tabsPerWindowLimit: document.getElementById('tabsPerWindowLimit'),
  rescanButton: document.getElementById('rescanButton'),
  closeAllDuplicatesButton: document.getElementById('closeAllDuplicatesButton'),
  sortCurrentWindowButton: document.getElementById('sortCurrentWindowButton'),
  sortAllWindowsButton: document.getElementById('sortAllWindowsButton'),
  groupSitesToWindowsButton: document.getElementById(
    'groupSitesToWindowsButton'
  ),
  status: document.getElementById('status'),
  sites: document.getElementById('sites')
};

const state = {
  tabs: [],
  siteGroups: []
};

document.addEventListener('DOMContentLoaded', async () => {
  bindEvents();
  await loadSettings(elements);
  await scanAndRender();
});

function bindEvents() {
  elements.rescanButton.addEventListener('click', scanAndRender);
  elements.closeAllDuplicatesButton.addEventListener(
    'click',
    handleCloseAllDuplicates
  );
  elements.sortCurrentWindowButton.addEventListener(
    'click',
    handleSortCurrentWindow
  );
  elements.sortAllWindowsButton.addEventListener('click', handleSortAllWindows);
  elements.groupSitesToWindowsButton.addEventListener(
    'click',
    handleMoveSitesToSeparateWindows
  );

  [
    elements.includeQueryParams,
    elements.includeHash,
    elements.ignoreTrailingSlash,
    elements.protectPinnedTabs,
    elements.showOnlyDuplicateSites,
    elements.allowGroupedDuplicateRemoval,
    elements.tabsPerWindowLimit
  ].forEach((checkbox) => {
    checkbox.addEventListener('change', async () => {
      await saveSettings(getOptions(elements));
      await scanAndRender();
    });
  });
}

async function scanAndRender() {
  await scanAndRenderWithStatus();
}

async function scanAndRenderWithStatus(statusPrefix = '') {
  elements.status.textContent = 'Сканирую вкладки...';
  elements.sites.innerHTML = '';

  const options = getOptions(elements);
  const tabs = await chrome.tabs.query({});

  state.tabs = tabs
    .filter((tab) => Boolean(tab.url))
    .filter((tab) => isSupportedUrl(tab.url));
  state.siteGroups = buildSiteGroups(state.tabs, options);
  const visibleSiteGroups = options.showOnlyDuplicateSites
    ? state.siteGroups.filter(siteHasDuplicateUrls)
    : state.siteGroups;

  renderSiteGroups({
    elements,
    siteGroups: visibleSiteGroups,
    options,
    onCloseSiteDuplicates: handleCloseSiteDuplicates,
    onCloseSite: handleCloseSite,
    onCloseTab: handleCloseTab,
    onActivateTab: handleActivateTab
  });

  const duplicateCount = getDuplicateTabIds(state.siteGroups, options).length;
  const summary =
    `Открыто вкладок: ${state.tabs.length}. ` +
    `Сайтов: ${visibleSiteGroups.length}/${state.siteGroups.length}. ` +
    `Дубликатов к удалению: ${duplicateCount}.`;

  elements.status.textContent = statusPrefix
    ? `${statusPrefix} ${summary}`
    : summary;
}

async function handleCloseSiteDuplicates(siteGroup, duplicateIdsForSite) {
  if (
    !confirmBulkAction(
      `Удалить ${duplicateIdsForSite.length} дублей сайта ${siteGroup.site}?`
    )
  ) {
    return;
  }

  await applyAction(closeDuplicateTabsByIds(duplicateIdsForSite));
}

async function handleCloseSite(siteGroup) {
  const tabIds = getClosableTabIds(siteGroup, getOptions(elements));

  if (tabIds.length === 0) {
    elements.status.textContent = 'Нет вкладок сайта для закрытия.';
    return;
  }

  if (
    !confirmBulkAction(
      `Закрыть ${tabIds.length} вкладок сайта ${siteGroup.site}?`
    )
  ) {
    return;
  }

  await applyAction(closeSiteTabsByIds(tabIds));
}

async function handleCloseTab(tab) {
  if (getOptions(elements).protectPinnedTabs && tab.pinned) {
    elements.status.textContent =
      'Закрытие закреплённой вкладки запрещено текущими настройками.';
    return;
  }

  await applyAction(closeTabById(tab.id));
}

async function handleActivateTab(tab) {
  const { message } = await activateTab(tab.id, tab.windowId);
  elements.status.textContent = message;
}

async function handleCloseAllDuplicates() {
  const duplicateTabIds = getDuplicateTabIds(
    state.siteGroups,
    getOptions(elements)
  );

  if (duplicateTabIds.length === 0) {
    elements.status.textContent = 'Дубликаты для удаления не найдены.';
    return;
  }

  if (
    !confirmBulkAction(`Удалить ${duplicateTabIds.length} вкладок-дубликатов?`)
  ) {
    return;
  }

  await applyAction(closeDuplicateTabsByIds(duplicateTabIds));
}

async function handleSortCurrentWindow() {
  await applyAction(sortTabsInCurrentWindow(state.tabs, getOptions(elements)));
}

async function handleSortAllWindows() {
  await applyAction(sortTabsInAllWindows(state.tabs, getOptions(elements)));
}

async function handleMoveSitesToSeparateWindows() {
  const options = getOptions(elements);
  elements.tabsPerWindowLimit.value = String(options.tabsPerWindowLimit);
  const windowTabGroups = buildWindowTabGroups(state.siteGroups, options);
  const movableTabsCount = windowTabGroups.flat().length;

  if (movableTabsCount === 0) {
    elements.status.textContent = 'Нет вкладок для разнесения по окнам.';
    return;
  }

  if (
    !confirmBulkAction(
      `Сформировать ${windowTabGroups.length} окон и перенести ${movableTabsCount} вкладок?`
    )
  ) {
    return;
  }

  await applyAction(moveSitesToSeparateWindows(state.siteGroups, options));
}

async function applyAction(actionPromise) {
  const { message } = await actionPromise;
  await scanAndRenderWithStatus(message);
}

function confirmBulkAction(message) {
  return window.confirm(message);
}

function getClosableTabIds(siteGroup, options) {
  return siteGroup.urlGroups
    .flatMap((urlGroup) => urlGroup.tabs)
    .filter((tab) => !options.protectPinnedTabs || !tab.pinned)
    .map((tab) => tab.id);
}
