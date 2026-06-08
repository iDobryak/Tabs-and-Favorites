import {
  getDuplicateTabIds,
  getDuplicateTabsForUrlGroup,
  isTabInGroup,
  sortTabsByWindowAndIndex
} from './groups.js';

export function renderSiteGroups({
  elements,
  siteGroups,
  options,
  onCloseSiteDuplicates,
  onCloseSite,
  onCloseTab,
  onActivateTab
}) {
  elements.sites.innerHTML = '';

  if (siteGroups.length === 0) {
    elements.sites.textContent = 'Нет сайтов, подходящих под текущие фильтры.';
    return;
  }

  for (const siteGroup of siteGroups) {
    const siteElement = document.createElement('section');
    siteElement.className = 'site';

    const duplicateIdsForSite = getDuplicateTabIds([siteGroup], options);
    const duplicateUrlGroupsCount = siteGroup.urlGroups.filter(
      (urlGroup) => urlGroup.tabs.length > 1
    ).length;
    const closableTabsCount = siteGroup.urlGroups
      .flatMap((urlGroup) => urlGroup.tabs)
      .filter((tab) => !options.protectPinnedTabs || !tab.pinned).length;

    const header = document.createElement('div');
    header.className = 'site-header';

    const titleWrapper = document.createElement('div');

    const title = document.createElement('div');
    title.className = 'site-title';
    title.textContent = siteGroup.site;

    const meta = document.createElement('div');
    meta.className = 'site-meta';
    meta.textContent =
      `Вкладок: ${siteGroup.totalTabs}. ` +
      `URL-групп: ${siteGroup.urlGroups.length}. ` +
      `URL с дублями: ${duplicateUrlGroupsCount}. ` +
      `К удалению: ${duplicateIdsForSite.length}.`;

    titleWrapper.appendChild(title);
    titleWrapper.appendChild(meta);

    const siteActions = document.createElement('div');
    siteActions.className = 'site-actions';

    const closeSiteDuplicatesButton = document.createElement('button');
    closeSiteDuplicatesButton.textContent = 'Удалить дубли сайта';
    closeSiteDuplicatesButton.disabled = duplicateIdsForSite.length === 0;
    closeSiteDuplicatesButton.addEventListener('click', async () => {
      await onCloseSiteDuplicates(siteGroup, duplicateIdsForSite);
    });

    const closeSiteButton = document.createElement('button');
    closeSiteButton.textContent = 'Закрыть сайт';
    closeSiteButton.className = 'danger';
    closeSiteButton.disabled = closableTabsCount === 0;
    closeSiteButton.addEventListener('click', async () => {
      await onCloseSite(siteGroup);
    });

    siteActions.appendChild(closeSiteDuplicatesButton);
    siteActions.appendChild(closeSiteButton);

    header.appendChild(titleWrapper);
    header.appendChild(siteActions);

    siteElement.appendChild(header);

    for (const urlGroup of siteGroup.urlGroups) {
      const urlGroupElement = document.createElement('div');
      urlGroupElement.className = 'url-group';

      const urlTitle = document.createElement('div');
      urlTitle.className = 'url-title';
      urlTitle.textContent = urlGroup.normalizedUrl;

      urlGroupElement.appendChild(urlTitle);

      const tabsSorted = sortTabsByWindowAndIndex(urlGroup.tabs);
      const duplicateTabIds = new Set(
        getDuplicateTabsForUrlGroup(urlGroup, options).map((tab) => tab.id)
      );

      tabsSorted.forEach((tab) => {
        const tabElement = document.createElement('div');
        tabElement.className = 'tab';

        const tabInfo = document.createElement('div');
        tabInfo.className = 'tab-info';

        const tabTitle = document.createElement('div');
        tabTitle.className = 'tab-title';
        tabTitle.textContent = tab.title || 'Без названия';

        const badges = document.createElement('div');
        badges.className = 'badges';
        badges.appendChild(createBadge(`Окно ${tab.windowId}`));

        if (duplicateTabIds.has(tab.id)) {
          badges.appendChild(createBadge('дубль', 'duplicate'));
        }

        if (isTabInGroup(tab)) {
          badges.appendChild(createBadge('в группе', 'grouped'));
        }

        if (tab.pinned) {
          badges.appendChild(createBadge('pinned', 'pinned'));
        }

        tabInfo.appendChild(tabTitle);
        tabInfo.appendChild(badges);

        const tabActions = document.createElement('div');
        tabActions.className = 'tab-actions';

        const activateTabButton = document.createElement('button');
        activateTabButton.textContent = 'Перейти';
        activateTabButton.addEventListener('click', async () => {
          await onActivateTab(tab);
        });

        const closeTabButton = document.createElement('button');
        closeTabButton.textContent = 'Закрыть';
        closeTabButton.className = 'danger';
        closeTabButton.disabled = options.protectPinnedTabs && tab.pinned;
        closeTabButton.addEventListener('click', async () => {
          await onCloseTab(tab);
        });

        tabActions.appendChild(activateTabButton);
        tabActions.appendChild(closeTabButton);

        tabElement.appendChild(tabInfo);
        tabElement.appendChild(tabActions);

        urlGroupElement.appendChild(tabElement);
      });

      siteElement.appendChild(urlGroupElement);
    }

    elements.sites.appendChild(siteElement);
  }
}

function createBadge(text, extraClass = '') {
  const badge = document.createElement('span');
  badge.className = extraClass ? `badge ${extraClass}` : 'badge';
  badge.textContent = text;
  return badge;
}
