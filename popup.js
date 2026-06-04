import { buildSiteGroups, getDuplicateTabIds } from './lib/groups.js';
import {
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
    elements.protectPinnedTabs
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

  renderSiteGroups({
    elements,
    siteGroups: state.siteGroups,
    options,
    onCloseSiteDuplicates: handleCloseSiteDuplicates
  });

  const duplicateCount = getDuplicateTabIds(state.siteGroups, options).length;
  const summary =
    `Открыто вкладок: ${state.tabs.length}. ` +
    `Сайтов: ${state.siteGroups.length}. ` +
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
  const movableTabsCount = state.siteGroups
    .flatMap((siteGroup) => siteGroup.urlGroups)
    .flatMap((urlGroup) => urlGroup.tabs)
    .filter((tab) => !options.protectPinnedTabs || !tab.pinned).length;

  if (movableTabsCount === 0) {
    elements.status.textContent = 'Нет вкладок для разнесения по окнам.';
    return;
  }

  if (!confirmBulkAction(`Разнести по окнам ${movableTabsCount} вкладок?`)) {
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
