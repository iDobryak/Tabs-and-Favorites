import {
  compareTabsForSorting,
  groupTabsByWindow,
  isTabInGroup,
  prepareTabsForSorting
} from './groups.js';

export async function closeDuplicateTabsByIds(tabIds, t) {
  if (tabIds.length === 0) {
    return {
      result: createOperationResult(),
      message: t('operationNoDuplicates')
    };
  }

  const result = await removeTabsByIds(tabIds);

  return {
    result,
    message: formatOperationStatus(t('actionCloseDuplicates'), result, t)
  };
}

export async function closeSiteTabsByIds(tabIds, t) {
  if (tabIds.length === 0) {
    return {
      result: createOperationResult(),
      message: t('operationNoSiteTabs')
    };
  }

  const result = await removeTabsByIds(tabIds);

  return {
    result,
    message: formatOperationStatus(t('actionCloseSiteTabs'), result, t)
  };
}

export async function closeTabById(tabId, t) {
  const result = await removeTabsByIds([tabId]);

  return {
    result,
    message: formatOperationStatus(t('actionCloseTab'), result, t)
  };
}

export async function activateTab(tabId, windowId, t) {
  try {
    await chrome.windows.update(windowId, { focused: true });
    await chrome.tabs.update(tabId, { active: true });

    return {
      result: { succeeded: 1, failed: 0 },
      message: t('actionActivateTabSuccess')
    };
  } catch {
    return {
      result: { succeeded: 0, failed: 1 },
      message: t('actionActivateTabFailure')
    };
  }
}

export async function sortTabsInCurrentWindow(tabs, options, t) {
  const currentWindow = await chrome.windows.getCurrent();
  const sortPlan = buildWindowSortPlan(
    tabs.filter((tab) => tab.windowId === currentWindow.id),
    options
  );

  const result = await moveTabsInsideWindow(sortPlan, currentWindow.id);

  return {
    result,
    message: formatOperationStatus(t('actionSortCurrentWindow'), result, t)
  };
}

export async function sortTabsInAllWindows(tabs, options, t) {
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
    message: formatOperationStatus(t('actionSortAllWindows'), result, t)
  };
}

export async function moveSitesToSeparateWindows(siteGroups, options, t) {
  const result = createOperationResult();
  const windowTabGroups = buildWindowTabGroups(siteGroups, options);
  const movableTabsCount = windowTabGroups.flat().length;

  if (movableTabsCount === 0) {
    return {
      result,
      message: t('operationNoTabsForWindows')
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
    message: formatOperationStatus(t('actionMoveSitesToWindows'), result, t)
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

function formatOperationStatus(actionLabel, result, t) {
  if (result.failed === 0) {
    return t('operationSuccess', {
      actionLabel,
      count: result.succeeded
    });
  }

  if (result.succeeded === 0) {
    return t('operationFailure', { actionLabel });
  }

  return t('operationPartialSuccess', {
    actionLabel,
    successCount: result.succeeded,
    failedCount: result.failed
  });
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
