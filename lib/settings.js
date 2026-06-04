export async function loadSettings(elements) {
  const settings = await chrome.storage.local.get([
    'includeQueryParams',
    'includeHash',
    'ignoreTrailingSlash',
    'protectPinnedTabs'
  ]);

  elements.includeQueryParams.checked = settings.includeQueryParams ?? true;
  elements.includeHash.checked = settings.includeHash ?? false;
  elements.ignoreTrailingSlash.checked = settings.ignoreTrailingSlash ?? true;
  elements.protectPinnedTabs.checked = settings.protectPinnedTabs ?? true;
}

export async function saveSettings(options) {
  await chrome.storage.local.set(options);
}

export function getOptions(elements) {
  return {
    includeQueryParams: elements.includeQueryParams.checked,
    includeHash: elements.includeHash.checked,
    ignoreTrailingSlash: elements.ignoreTrailingSlash.checked,
    protectPinnedTabs: elements.protectPinnedTabs.checked
  };
}
