import { getDuplicateTabIds, sortTabsByWindowAndIndex } from './groups.js';

export function renderSiteGroups({
  elements,
  siteGroups,
  options,
  onCloseSiteDuplicates
}) {
  elements.sites.innerHTML = '';

  if (siteGroups.length === 0) {
    elements.sites.textContent = 'Нет доступных вкладок для анализа.';
    return;
  }

  for (const siteGroup of siteGroups) {
    const siteElement = document.createElement('section');
    siteElement.className = 'site';

    const duplicateIdsForSite = getDuplicateTabIds([siteGroup], options);

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
      `Дублей: ${duplicateIdsForSite.length}.`;

    titleWrapper.appendChild(title);
    titleWrapper.appendChild(meta);

    const closeSiteDuplicatesButton = document.createElement('button');
    closeSiteDuplicatesButton.textContent = 'Удалить дубли сайта';
    closeSiteDuplicatesButton.disabled = duplicateIdsForSite.length === 0;
    closeSiteDuplicatesButton.addEventListener('click', async () => {
      await onCloseSiteDuplicates(siteGroup, duplicateIdsForSite);
    });

    header.appendChild(titleWrapper);
    header.appendChild(closeSiteDuplicatesButton);

    siteElement.appendChild(header);

    for (const urlGroup of siteGroup.urlGroups) {
      const urlGroupElement = document.createElement('div');
      urlGroupElement.className = 'url-group';

      const urlTitle = document.createElement('div');
      urlTitle.className = 'url-title';
      urlTitle.textContent = urlGroup.normalizedUrl;

      urlGroupElement.appendChild(urlTitle);

      const tabsSorted = sortTabsByWindowAndIndex(urlGroup.tabs);

      tabsSorted.forEach((tab, index) => {
        const tabElement = document.createElement('div');
        tabElement.className = 'tab';

        const tabTitle = document.createElement('div');
        tabTitle.className = 'tab-title';
        tabTitle.textContent = tab.title || 'Без названия';

        const badges = document.createElement('div');
        badges.appendChild(createBadge(`Окно ${tab.windowId}`));

        if (index > 0) {
          badges.appendChild(createBadge('дубль', 'duplicate'));
        }

        if (tab.pinned) {
          badges.appendChild(createBadge('pinned', 'pinned'));
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

function createBadge(text, extraClass = '') {
  const badge = document.createElement('span');
  badge.className = extraClass ? `badge ${extraClass}` : 'badge';
  badge.textContent = text;
  return badge;
}
