export async function loadSettings(elements) {
  const settings = await chrome.storage.local.get([
    'uiLanguage',
    'includeQueryParams',
    'includeHash',
    'ignoreTrailingSlash',
    'protectPinnedTabs',
    'tabsPerWindowLimit',
    'showOnlyDuplicateSites',
    'allowGroupedDuplicateRemoval'
  ]);

  elements.uiLanguage.value = settings.uiLanguage ?? 'auto';
  elements.includeQueryParams.checked = settings.includeQueryParams ?? true;
  elements.includeHash.checked = settings.includeHash ?? false;
  elements.ignoreTrailingSlash.checked = settings.ignoreTrailingSlash ?? true;
  elements.protectPinnedTabs.checked = settings.protectPinnedTabs ?? true;
  elements.tabsPerWindowLimit.value = String(settings.tabsPerWindowLimit ?? 20);
  elements.showOnlyDuplicateSites.checked =
    settings.showOnlyDuplicateSites ?? false;
  elements.allowGroupedDuplicateRemoval.checked =
    settings.allowGroupedDuplicateRemoval ?? false;
}

export async function saveSettings(options) {
  await chrome.storage.local.set(options);
}

export function getOptions(elements) {
  return {
    uiLanguage: elements.uiLanguage.value || 'auto',
    includeQueryParams: elements.includeQueryParams.checked,
    includeHash: elements.includeHash.checked,
    ignoreTrailingSlash: elements.ignoreTrailingSlash.checked,
    protectPinnedTabs: elements.protectPinnedTabs.checked,
    tabsPerWindowLimit: getTabsPerWindowLimit(
      elements.tabsPerWindowLimit.value
    ),
    showOnlyDuplicateSites: elements.showOnlyDuplicateSites.checked,
    allowGroupedDuplicateRemoval: elements.allowGroupedDuplicateRemoval.checked
  };
}

export function getTabsPerWindowLimit(rawValue) {
  const parsedValue = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return 20;
  }

  return parsedValue;
}
