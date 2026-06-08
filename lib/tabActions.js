import {
  compareTabsForSorting,
  groupTabsByWindow,
  isTabInGroup,
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

export async function closeSiteTabsByIds(tabIds) {
  if (tabIds.length === 0) {
    return {
      result: createOperationResult(),
      message: 'Нет вкладок сайта для удаления.'
    };
  }

  const result = await removeTabsByIds(tabIds);

  return {
    result,
    message: formatOperationStatus('Закрытие вкладок сайта', result)
  };
}

export async function closeTabById(tabId) {
  const result = await removeTabsByIds([tabId]);

  return {
    result,
    message: formatOperationStatus('Закрытие вкладки', result)
  };
}

export async function activateTab(tabId, windowId) {
  try {
    await chrome.windows.update(windowId, { focused: true });
    await chrome.tabs.update(tabId, { active: true });

    return {
      result: { succeeded: 1, failed: 0 },
      message: 'Переход к вкладке выполнен.'
    };
  } catch {
    return {
      result: { succeeded: 0, failed: 1 },
      message: 'Не удалось перейти к выбранной вкладке.'
    };
  }
}

export async function sortTabsInCurrentWindow(tabs, options) {
  const currentWindow = await chrome.windows.getCurrent();
  const sortPlan = buildWindowSortPlan(
    tabs.filter((tab) => tab.windowId === currentWindow.id),
    options
  );

  const result = await moveTabsInsideWindow(sortPlan, currentWindow.id);

  return {
    result,
    message: formatOperationStatus('Сортировка текущего окна', result)
  };
}

export async function sortTabsInAllWindows(tabs, options) {
  const tabsByWindow = groupTabsByWindow(tabs);
  const result = createOperationResult();

  for (const [windowId, windowTabs] of tabsByWindow.entries()) {
    const sortPlan = buildWindowSortPlan(windowTabs, options);
    mergeOperationResult(
      result,
      await moveTabsInsideWindow(sortPlan, Number(windowId))
    );
  }

  return {
    result,
    message: formatOperationStatus('Сортировка всех окон', result)
  };
}

export async function moveSitesToSeparateWindows(siteGroups, options) {
  const result = createOperationResult();
  const windowTabGroups = buildWindowTabGroups(siteGroups, options);
  const movableTabsCount = windowTabGroups.flat().length;

  if (movableTabsCount === 0) {
    return {
      result,
      message: 'Нет вкладок для разнесения по окнам.'
    };
  }

  for (const tabs of windowTabGroups) {
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

export function buildWindowTabGroups(siteGroups, options) {
  const tabsPerWindowLimit = normalizeTabsPerWindowLimit(
    options.tabsPerWindowLimit
  );
  const windowTabGroups = [];
  let currentWindowTabs = [];

  for (const siteGroup of siteGroups) {
    const siteTabs = prepareTabsForSorting(
      siteGroup.urlGroups
        .flatMap((urlGroup) => urlGroup.tabs)
        .filter((tab) => !options.protectPinnedTabs || !tab.pinned),
      options
    ).sort(compareTabsForSorting);

    if (siteTabs.length === 0) {
      continue;
    }

    if (siteTabs.length > tabsPerWindowLimit) {
      if (currentWindowTabs.length > 0) {
        windowTabGroups.push(currentWindowTabs);
        currentWindowTabs = [];
      }

      windowTabGroups.push(siteTabs);
      continue;
    }

    if (currentWindowTabs.length + siteTabs.length > tabsPerWindowLimit) {
      windowTabGroups.push(currentWindowTabs);
      currentWindowTabs = [...siteTabs];
      continue;
    }

    currentWindowTabs.push(...siteTabs);
  }

  if (currentWindowTabs.length > 0) {
    windowTabGroups.push(currentWindowTabs);
  }

  return windowTabGroups;
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
  const { movableTabs, targetIndexes } = sortedTabs;

  for (let i = 0; i < movableTabs.length; i++) {
    try {
      await chrome.tabs.move(movableTabs[i].id, {
        windowId,
        index: targetIndexes[i]
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

function normalizeTabsPerWindowLimit(value) {
  if (Number.isInteger(value) && value > 0) {
    return value;
  }

  return 20;
}

export function buildWindowSortPlan(windowTabs, options) {
  const preparedTabs = prepareTabsForSorting(windowTabs, options);
  const movableTabs = preparedTabs
    .filter((tab) => !tab.pinned && !isTabInGroup(tab))
    .sort(compareTabsForSorting);
  const targetIndexes = preparedTabs
    .filter((tab) => !tab.pinned && !isTabInGroup(tab))
    .map((tab) => tab.index)
    .sort((a, b) => a - b);

  return {
    movableTabs,
    targetIndexes
  };
}
