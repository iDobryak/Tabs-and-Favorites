import {
  compareTabsForSorting,
  groupTabsByWindow,
  prepareTabsForSorting
} from './groups.js';

export async function closeDuplicateTabsByIds(tabIds) {
  if (tabIds.length === 0) {
    return {
      result: createOperationResult(),
      message: 'Дубликаты для удаления не найдены.'
    };
  }

  const result = await removeTabsByIds(tabIds);

  return {
    result,
    message: formatOperationStatus('Удаление дублей', result)
  };
}

export async function sortTabsInCurrentWindow(tabs, options) {
  const currentWindow = await chrome.windows.getCurrent();
  const sortedTabs = prepareTabsForSorting(
    tabs.filter((tab) => tab.windowId === currentWindow.id),
    options
  ).sort(compareTabsForSorting);

  const result = await moveTabsInsideWindow(sortedTabs, currentWindow.id);

  return {
    result,
    message: formatOperationStatus('Сортировка текущего окна', result)
  };
}

export async function sortTabsInAllWindows(tabs, options) {
  const tabsByWindow = groupTabsByWindow(tabs);
  const result = createOperationResult();

  for (const [windowId, windowTabs] of tabsByWindow.entries()) {
    const sortedTabs = prepareTabsForSorting(windowTabs, options).sort(
      compareTabsForSorting
    );
    mergeOperationResult(
      result,
      await moveTabsInsideWindow(sortedTabs, Number(windowId))
    );
  }

  return {
    result,
    message: formatOperationStatus('Сортировка всех окон', result)
  };
}

export async function moveSitesToSeparateWindows(siteGroups, options) {
  const result = createOperationResult();
  const movableTabsCount = siteGroups
    .flatMap((siteGroup) => siteGroup.urlGroups)
    .flatMap((urlGroup) => urlGroup.tabs)
    .filter((tab) => !options.protectPinnedTabs || !tab.pinned).length;

  if (movableTabsCount === 0) {
    return {
      result,
      message: 'Нет вкладок для разнесения по окнам.'
    };
  }

  for (const siteGroup of siteGroups) {
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

  return {
    result,
    message: formatOperationStatus('Разнесение сайтов по окнам', result)
  };
}

function createOperationResult() {
  return {
    succeeded: 0,
    failed: 0
  };
}

function mergeOperationResult(target, source) {
  target.succeeded += source.succeeded;
  target.failed += source.failed;
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
