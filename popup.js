import {
  buildSiteGroups,
  getDuplicateTabIds,
  siteHasDuplicateUrls
} from './lib/groups.js';
import {
  createTranslator,
  getBrowserLanguages,
  getLanguageChoices,
  resolveUiLanguage
} from './lib/i18n.js';
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
  appTitle: document.getElementById('appTitle'),
  settingsLanguageLabel: document.getElementById('settingsLanguageLabel'),
  uiLanguage: document.getElementById('uiLanguage'),
  includeQueryParams: document.getElementById('includeQueryParams'),
  includeQueryParamsLabel: document.getElementById('includeQueryParamsLabel'),
  includeHash: document.getElementById('includeHash'),
  includeHashLabel: document.getElementById('includeHashLabel'),
  ignoreTrailingSlash: document.getElementById('ignoreTrailingSlash'),
  ignoreTrailingSlashLabel: document.getElementById('ignoreTrailingSlashLabel'),
  protectPinnedTabs: document.getElementById('protectPinnedTabs'),
  protectPinnedTabsLabel: document.getElementById('protectPinnedTabsLabel'),
  showOnlyDuplicateSites: document.getElementById('showOnlyDuplicateSites'),
  showOnlyDuplicateSitesLabel: document.getElementById(
    'showOnlyDuplicateSitesLabel'
  ),
  allowGroupedDuplicateRemoval: document.getElementById(
    'allowGroupedDuplicateRemoval'
  ),
  allowGroupedDuplicateRemovalLabel: document.getElementById(
    'allowGroupedDuplicateRemovalLabel'
  ),
  tabsPerWindowLimit: document.getElementById('tabsPerWindowLimit'),
  tabsPerWindowLimitLabel: document.getElementById('tabsPerWindowLimitLabel'),
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
  siteGroups: [],
  resolvedLanguage: 'en',
  t: createTranslator('en')
};

document.addEventListener('DOMContentLoaded', async () => {
  bindEvents();
  updateLanguageSelect('auto');
  await loadSettings(elements);
  applyLocalization();
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
  elements.uiLanguage.addEventListener('change', async () => {
    await saveSettings(getOptions(elements));
    applyLocalization();
    await scanAndRender();
  });

  [
    elements.includeQueryParams,
    elements.includeHash,
    elements.ignoreTrailingSlash,
    elements.protectPinnedTabs,
    elements.showOnlyDuplicateSites,
    elements.allowGroupedDuplicateRemoval,
    elements.tabsPerWindowLimit
  ].forEach((input) => {
    input.addEventListener('change', async () => {
      await saveSettings(getOptions(elements));
      await scanAndRender();
    });
  });
}

async function scanAndRender() {
  await scanAndRenderWithStatus();
}

async function scanAndRenderWithStatus(statusPrefix = '') {
  elements.status.textContent = state.t('statusScanning');
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
    t: state.t,
    onCloseSiteDuplicates: handleCloseSiteDuplicates,
    onCloseSite: handleCloseSite,
    onCloseTab: handleCloseTab,
    onActivateTab: handleActivateTab
  });

  const duplicateCount = getDuplicateTabIds(state.siteGroups, options).length;
  const summary = state.t('summary', {
    tabsCount: state.tabs.length,
    visibleSitesCount: visibleSiteGroups.length,
    totalSitesCount: state.siteGroups.length,
    duplicateCount
  });

  elements.status.textContent = statusPrefix
    ? `${statusPrefix} ${summary}`
    : summary;
}

async function handleCloseSiteDuplicates(siteGroup, duplicateIdsForSite) {
  if (
    !confirmBulkAction(
      state.t('confirmCloseSiteDuplicates', {
        count: duplicateIdsForSite.length,
        site: siteGroup.site
      })
    )
  ) {
    return;
  }

  await applyAction(closeDuplicateTabsByIds(duplicateIdsForSite, state.t));
}

async function handleCloseSite(siteGroup) {
  const tabIds = getClosableTabIds(siteGroup, getOptions(elements));

  if (tabIds.length === 0) {
    elements.status.textContent = state.t('statusNoSiteTabsToClose');
    return;
  }

  if (
    !confirmBulkAction(
      state.t('confirmCloseSite', {
        count: tabIds.length,
        site: siteGroup.site
      })
    )
  ) {
    return;
  }

  await applyAction(closeSiteTabsByIds(tabIds, state.t));
}

async function handleCloseTab(tab) {
  if (getOptions(elements).protectPinnedTabs && tab.pinned) {
    elements.status.textContent = state.t('statusPinnedCloseBlocked');
    return;
  }

  await applyAction(closeTabById(tab.id, state.t));
}

async function handleActivateTab(tab) {
  const { message } = await activateTab(tab.id, tab.windowId, state.t);
  elements.status.textContent = message;
}

async function handleCloseAllDuplicates() {
  const duplicateTabIds = getDuplicateTabIds(
    state.siteGroups,
    getOptions(elements)
  );

  if (duplicateTabIds.length === 0) {
    elements.status.textContent = state.t('statusNoDuplicatesFound');
    return;
  }

  if (
    !confirmBulkAction(
      state.t('confirmCloseAllDuplicates', { count: duplicateTabIds.length })
    )
  ) {
    return;
  }

  await applyAction(closeDuplicateTabsByIds(duplicateTabIds, state.t));
}

async function handleSortCurrentWindow() {
  await applyAction(
    sortTabsInCurrentWindow(state.tabs, getOptions(elements), state.t)
  );
}

async function handleSortAllWindows() {
  await applyAction(
    sortTabsInAllWindows(state.tabs, getOptions(elements), state.t)
  );
}

async function handleMoveSitesToSeparateWindows() {
  const options = getOptions(elements);
  elements.tabsPerWindowLimit.value = String(options.tabsPerWindowLimit);
  const windowTabGroups = buildWindowTabGroups(state.siteGroups, options);
  const movableTabsCount = windowTabGroups.flat().length;

  if (movableTabsCount === 0) {
    elements.status.textContent = state.t('statusNoTabsForWindows');
    return;
  }

  if (
    !confirmBulkAction(
      state.t('confirmDistributeToWindows', {
        windowsCount: windowTabGroups.length,
        tabsCount: movableTabsCount
      })
    )
  ) {
    return;
  }

  await applyAction(
    moveSitesToSeparateWindows(state.siteGroups, options, state.t)
  );
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

function applyLocalization() {
  const options = getOptions(elements);
  state.resolvedLanguage = resolveUiLanguage(
    options.uiLanguage,
    getBrowserLanguages()
  );
  state.t = createTranslator(state.resolvedLanguage);

  updateLanguageSelect(options.uiLanguage);

  document.documentElement.lang = state.resolvedLanguage;
  document.title = state.t('popupTitle');
  elements.appTitle.textContent = state.t('appTitle');
  elements.settingsLanguageLabel.textContent = state.t('languageLabel');
  elements.includeQueryParamsLabel.textContent = state.t('includeQueryParams');
  elements.includeHashLabel.textContent = state.t('includeHash');
  elements.ignoreTrailingSlashLabel.textContent = state.t(
    'ignoreTrailingSlash'
  );
  elements.protectPinnedTabsLabel.textContent = state.t('protectPinnedTabs');
  elements.showOnlyDuplicateSitesLabel.textContent = state.t(
    'showOnlyDuplicateSites'
  );
  elements.allowGroupedDuplicateRemovalLabel.textContent = state.t(
    'allowGroupedDuplicateRemoval'
  );
  elements.tabsPerWindowLimitLabel.textContent = state.t('tabsPerWindowLimit');
  elements.rescanButton.textContent = state.t('rescanButton');
  elements.closeAllDuplicatesButton.textContent = state.t(
    'closeAllDuplicatesButton'
  );
  elements.sortCurrentWindowButton.textContent = state.t(
    'sortCurrentWindowButton'
  );
  elements.sortAllWindowsButton.textContent = state.t('sortAllWindowsButton');
  elements.groupSitesToWindowsButton.textContent = state.t(
    'groupSitesToWindowsButton'
  );
}

function updateLanguageSelect(selectedValue) {
  const previousValue = selectedValue || 'auto';
  elements.uiLanguage.innerHTML = '';

  for (const choice of getLanguageChoices(state.t)) {
    const optionElement = document.createElement('option');
    optionElement.value = choice.value;
    optionElement.textContent = choice.label;
    optionElement.selected = choice.value === previousValue;
    elements.uiLanguage.appendChild(optionElement);
  }
}
