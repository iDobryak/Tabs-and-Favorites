export const AUTO_LANGUAGE = 'auto';
export const DEFAULT_LANGUAGE = 'en';
export const SUPPORTED_LANGUAGES = ['en', 'ru', 'es', 'fr', 'de', 'zh'];

const TRANSLATIONS = {
  en: {
    appTitle: 'Open Tabs',
    popupTitle: 'Tab Duplicate Cleaner & Sorter',
    settingsLanguage: 'Interface language',
    languageLabel: 'Language',
    languageAuto: 'Auto',
    languageNameEn: 'English',
    languageNameRu: 'Russian',
    languageNameEs: 'Spanish',
    languageNameFr: 'French',
    languageNameDe: 'German',
    languageNameZh: 'Chinese',
    includeQueryParams: 'Include query parameters',
    includeHash: 'Include hash fragments',
    ignoreTrailingSlash: 'Treat /page and /page/ as the same',
    protectPinnedTabs: 'Do not close or move pinned tabs',
    showOnlyDuplicateSites: 'Show only sites with duplicates',
    allowGroupedDuplicateRemoval: 'Remove duplicates inside tab groups',
    rescanButton: 'Refresh list',
    closeAllDuplicatesButton: 'Remove all duplicates',
    sortCurrentWindowButton: 'Sort current window',
    sortAllWindowsButton: 'Sort all windows',
    groupSitesToWindowsButton: 'Distribute sites across windows',
    tabsPerWindowLimit: 'Tabs per window',
    statusScanning: 'Scanning tabs...',
    statusNoSiteTabsToClose: 'No site tabs available to close.',
    statusPinnedCloseBlocked:
      'Closing a pinned tab is blocked by the current settings.',
    statusNoDuplicatesFound: 'No duplicates found for removal.',
    statusNoTabsForWindows: 'No tabs available to distribute across windows.',
    confirmCloseSiteDuplicates: 'Remove {count} duplicate tabs for {site}?',
    confirmCloseSite: 'Close {count} tabs for {site}?',
    confirmCloseAllDuplicates: 'Remove {count} duplicate tabs?',
    confirmDistributeToWindows:
      'Create {windowsCount} windows and move {tabsCount} tabs?',
    summary:
      'Open tabs: {tabsCount}. Sites: {visibleSitesCount}/{totalSitesCount}. Duplicates to remove: {duplicateCount}.',
    noSitesForCurrentFilters: 'No sites match the current filters.',
    siteMeta:
      'Tabs: {tabsCount}. URL groups: {urlGroupsCount}. URLs with duplicates: {duplicateUrlGroupsCount}. Removable: {removableDuplicatesCount}.',
    closeSiteDuplicatesButton: 'Remove site duplicates',
    closeSiteButton: 'Close site',
    untitledTab: 'Untitled',
    badgeWindow: 'Window {windowId}',
    badgeDuplicate: 'duplicate',
    badgeGrouped: 'in group',
    badgePinned: 'pinned',
    activateTabButton: 'Go to',
    closeTabButton: 'Close',
    actionCloseDuplicates: 'Removing duplicates',
    actionCloseSiteTabs: 'Closing site tabs',
    actionCloseTab: 'Closing tab',
    actionActivateTabSuccess: 'Switched to the selected tab.',
    actionActivateTabFailure: 'Could not switch to the selected tab.',
    actionSortCurrentWindow: 'Sorting current window',
    actionSortAllWindows: 'Sorting all windows',
    actionMoveSitesToWindows: 'Distributing sites across windows',
    operationNoDuplicates: 'No duplicates found for removal.',
    operationNoSiteTabs: 'No site tabs available to remove.',
    operationNoTabsForWindows:
      'No tabs available to distribute across windows.',
    operationSuccess: '{actionLabel}: processed {count}.',
    operationFailure: '{actionLabel}: the operation could not be completed.',
    operationPartialSuccess:
      '{actionLabel}: processed {successCount}, errors {failedCount}.'
  },
  ru: {
    appTitle: 'Открытые ссылки',
    popupTitle: 'Tab Duplicate Cleaner & Sorter',
    settingsLanguage: 'Язык интерфейса',
    languageLabel: 'Язык',
    languageAuto: 'Авто',
    languageNameEn: 'Английский',
    languageNameRu: 'Русский',
    languageNameEs: 'Испанский',
    languageNameFr: 'Французский',
    languageNameDe: 'Немецкий',
    languageNameZh: 'Китайский',
    includeQueryParams: 'Учитывать query-параметры',
    includeHash: 'Учитывать hash-атрибуты',
    ignoreTrailingSlash: 'Считать /page и /page/ одинаковыми',
    protectPinnedTabs: 'Не закрывать и не переносить закреплённые вкладки',
    showOnlyDuplicateSites: 'Показывать только сайты с дублями',
    allowGroupedDuplicateRemoval: 'Удалять дубликаты внутри групп вкладок',
    rescanButton: 'Обновить список',
    closeAllDuplicatesButton: 'Удалить все дубликаты',
    sortCurrentWindowButton: 'Отсортировать текущее окно',
    sortAllWindowsButton: 'Отсортировать все окна',
    groupSitesToWindowsButton: 'Разнести сайты по окнам',
    tabsPerWindowLimit: 'Вкладок в окне',
    statusScanning: 'Сканирую вкладки...',
    statusNoSiteTabsToClose: 'Нет вкладок сайта для закрытия.',
    statusPinnedCloseBlocked:
      'Закрытие закреплённой вкладки запрещено текущими настройками.',
    statusNoDuplicatesFound: 'Дубликаты для удаления не найдены.',
    statusNoTabsForWindows: 'Нет вкладок для разнесения по окнам.',
    confirmCloseSiteDuplicates: 'Удалить {count} дублей сайта {site}?',
    confirmCloseSite: 'Закрыть {count} вкладок сайта {site}?',
    confirmCloseAllDuplicates: 'Удалить {count} вкладок-дубликатов?',
    confirmDistributeToWindows:
      'Сформировать {windowsCount} окон и перенести {tabsCount} вкладок?',
    summary:
      'Открыто вкладок: {tabsCount}. Сайтов: {visibleSitesCount}/{totalSitesCount}. Дубликатов к удалению: {duplicateCount}.',
    noSitesForCurrentFilters: 'Нет сайтов, подходящих под текущие фильтры.',
    siteMeta:
      'Вкладок: {tabsCount}. URL-групп: {urlGroupsCount}. URL с дублями: {duplicateUrlGroupsCount}. К удалению: {removableDuplicatesCount}.',
    closeSiteDuplicatesButton: 'Удалить дубли сайта',
    closeSiteButton: 'Закрыть сайт',
    untitledTab: 'Без названия',
    badgeWindow: 'Окно {windowId}',
    badgeDuplicate: 'дубль',
    badgeGrouped: 'в группе',
    badgePinned: 'pinned',
    activateTabButton: 'Перейти',
    closeTabButton: 'Закрыть',
    actionCloseDuplicates: 'Удаление дублей',
    actionCloseSiteTabs: 'Закрытие вкладок сайта',
    actionCloseTab: 'Закрытие вкладки',
    actionActivateTabSuccess: 'Переход к вкладке выполнен.',
    actionActivateTabFailure: 'Не удалось перейти к выбранной вкладке.',
    actionSortCurrentWindow: 'Сортировка текущего окна',
    actionSortAllWindows: 'Сортировка всех окон',
    actionMoveSitesToWindows: 'Разнесение сайтов по окнам',
    operationNoDuplicates: 'Дубликаты для удаления не найдены.',
    operationNoSiteTabs: 'Нет вкладок сайта для удаления.',
    operationNoTabsForWindows: 'Нет вкладок для разнесения по окнам.',
    operationSuccess: '{actionLabel}: успешно обработано {count}.',
    operationFailure: '{actionLabel}: не удалось выполнить операцию.',
    operationPartialSuccess:
      '{actionLabel}: успешно обработано {successCount}, ошибок {failedCount}.'
  },
  es: {
    appTitle: 'Pestanas abiertas',
    popupTitle: 'Tab Duplicate Cleaner & Sorter',
    settingsLanguage: 'Idioma de la interfaz',
    languageLabel: 'Idioma',
    languageAuto: 'Automatico',
    languageNameEn: 'Ingles',
    languageNameRu: 'Ruso',
    languageNameEs: 'Espanol',
    languageNameFr: 'Frances',
    languageNameDe: 'Aleman',
    languageNameZh: 'Chino',
    includeQueryParams: 'Incluir parametros de consulta',
    includeHash: 'Incluir fragmentos hash',
    ignoreTrailingSlash: 'Tratar /page y /page/ como iguales',
    protectPinnedTabs: 'No cerrar ni mover pestanas fijadas',
    showOnlyDuplicateSites: 'Mostrar solo sitios con duplicados',
    allowGroupedDuplicateRemoval:
      'Eliminar duplicados dentro de grupos de pestanas',
    rescanButton: 'Actualizar lista',
    closeAllDuplicatesButton: 'Eliminar todos los duplicados',
    sortCurrentWindowButton: 'Ordenar ventana actual',
    sortAllWindowsButton: 'Ordenar todas las ventanas',
    groupSitesToWindowsButton: 'Distribuir sitios en ventanas',
    tabsPerWindowLimit: 'Pestanas por ventana',
    statusScanning: 'Escaneando pestanas...',
    statusNoSiteTabsToClose: 'No hay pestanas del sitio para cerrar.',
    statusPinnedCloseBlocked:
      'Cerrar una pestana fijada esta bloqueado por la configuracion actual.',
    statusNoDuplicatesFound: 'No se encontraron duplicados para eliminar.',
    statusNoTabsForWindows:
      'No hay pestanas disponibles para distribuir en ventanas.',
    confirmCloseSiteDuplicates:
      'Eliminar {count} pestanas duplicadas de {site}?',
    confirmCloseSite: 'Cerrar {count} pestanas de {site}?',
    confirmCloseAllDuplicates: 'Eliminar {count} pestanas duplicadas?',
    confirmDistributeToWindows:
      'Crear {windowsCount} ventanas y mover {tabsCount} pestanas?',
    summary:
      'Pestanas abiertas: {tabsCount}. Sitios: {visibleSitesCount}/{totalSitesCount}. Duplicados para eliminar: {duplicateCount}.',
    noSitesForCurrentFilters:
      'No hay sitios que coincidan con los filtros actuales.',
    siteMeta:
      'Pestanas: {tabsCount}. Grupos de URL: {urlGroupsCount}. URL con duplicados: {duplicateUrlGroupsCount}. Eliminables: {removableDuplicatesCount}.',
    closeSiteDuplicatesButton: 'Eliminar duplicados del sitio',
    closeSiteButton: 'Cerrar sitio',
    untitledTab: 'Sin titulo',
    badgeWindow: 'Ventana {windowId}',
    badgeDuplicate: 'duplicado',
    badgeGrouped: 'en grupo',
    badgePinned: 'fijada',
    activateTabButton: 'Ir',
    closeTabButton: 'Cerrar',
    actionCloseDuplicates: 'Eliminando duplicados',
    actionCloseSiteTabs: 'Cerrando pestanas del sitio',
    actionCloseTab: 'Cerrando pestana',
    actionActivateTabSuccess: 'Se cambio a la pestana seleccionada.',
    actionActivateTabFailure: 'No se pudo cambiar a la pestana seleccionada.',
    actionSortCurrentWindow: 'Ordenando ventana actual',
    actionSortAllWindows: 'Ordenando todas las ventanas',
    actionMoveSitesToWindows: 'Distribuyendo sitios en ventanas',
    operationNoDuplicates: 'No se encontraron duplicados para eliminar.',
    operationNoSiteTabs: 'No hay pestanas del sitio para eliminar.',
    operationNoTabsForWindows:
      'No hay pestanas disponibles para distribuir en ventanas.',
    operationSuccess: '{actionLabel}: {count} procesadas.',
    operationFailure: '{actionLabel}: no se pudo completar la operacion.',
    operationPartialSuccess:
      '{actionLabel}: {successCount} procesadas, errores {failedCount}.'
  },
  fr: {
    appTitle: 'Onglets ouverts',
    popupTitle: 'Tab Duplicate Cleaner & Sorter',
    settingsLanguage: "Langue de l'interface",
    languageLabel: 'Langue',
    languageAuto: 'Auto',
    languageNameEn: 'Anglais',
    languageNameRu: 'Russe',
    languageNameEs: 'Espagnol',
    languageNameFr: 'Francais',
    languageNameDe: 'Allemand',
    languageNameZh: 'Chinois',
    includeQueryParams: 'Inclure les parametres de requete',
    includeHash: 'Inclure les fragments hash',
    ignoreTrailingSlash: 'Considerer /page et /page/ comme identiques',
    protectPinnedTabs: 'Ne pas fermer ni deplacer les onglets epingles',
    showOnlyDuplicateSites: 'Afficher uniquement les sites avec des doublons',
    allowGroupedDuplicateRemoval:
      "Supprimer les doublons dans les groupes d'onglets",
    rescanButton: 'Actualiser la liste',
    closeAllDuplicatesButton: 'Supprimer tous les doublons',
    sortCurrentWindowButton: 'Trier la fenetre actuelle',
    sortAllWindowsButton: 'Trier toutes les fenetres',
    groupSitesToWindowsButton: 'Repartir les sites par fenetres',
    tabsPerWindowLimit: 'Onglets par fenetre',
    statusScanning: 'Analyse des onglets...',
    statusNoSiteTabsToClose: 'Aucun onglet du site a fermer.',
    statusPinnedCloseBlocked:
      "La fermeture d'un onglet epingle est bloquee par les parametres actuels.",
    statusNoDuplicatesFound: 'Aucun doublon a supprimer.',
    statusNoTabsForWindows:
      'Aucun onglet disponible pour la repartition par fenetres.',
    confirmCloseSiteDuplicates:
      'Supprimer {count} onglets en double pour {site} ?',
    confirmCloseSite: 'Fermer {count} onglets pour {site} ?',
    confirmCloseAllDuplicates: 'Supprimer {count} onglets en double ?',
    confirmDistributeToWindows:
      'Creer {windowsCount} fenetres et deplacer {tabsCount} onglets ?',
    summary:
      'Onglets ouverts : {tabsCount}. Sites : {visibleSitesCount}/{totalSitesCount}. Doublons a supprimer : {duplicateCount}.',
    noSitesForCurrentFilters: 'Aucun site ne correspond aux filtres actuels.',
    siteMeta:
      'Onglets : {tabsCount}. Groupes URL : {urlGroupsCount}. URL avec doublons : {duplicateUrlGroupsCount}. Supprimables : {removableDuplicatesCount}.',
    closeSiteDuplicatesButton: 'Supprimer les doublons du site',
    closeSiteButton: 'Fermer le site',
    untitledTab: 'Sans titre',
    badgeWindow: 'Fenetre {windowId}',
    badgeDuplicate: 'doublon',
    badgeGrouped: 'dans un groupe',
    badgePinned: 'epingle',
    activateTabButton: 'Ouvrir',
    closeTabButton: 'Fermer',
    actionCloseDuplicates: 'Suppression des doublons',
    actionCloseSiteTabs: 'Fermeture des onglets du site',
    actionCloseTab: "Fermeture de l'onglet",
    actionActivateTabSuccess: "Bascule vers l'onglet selectionne.",
    actionActivateTabFailure: "Impossible d'acceder a l'onglet selectionne.",
    actionSortCurrentWindow: 'Tri de la fenetre actuelle',
    actionSortAllWindows: 'Tri de toutes les fenetres',
    actionMoveSitesToWindows: 'Repartition des sites par fenetres',
    operationNoDuplicates: 'Aucun doublon a supprimer.',
    operationNoSiteTabs: 'Aucun onglet du site a supprimer.',
    operationNoTabsForWindows:
      'Aucun onglet disponible pour la repartition par fenetres.',
    operationSuccess: '{actionLabel} : {count} traites.',
    operationFailure: "{actionLabel} : l'operation a echoue.",
    operationPartialSuccess:
      '{actionLabel} : {successCount} traites, erreurs {failedCount}.'
  },
  de: {
    appTitle: 'Offene Tabs',
    popupTitle: 'Tab Duplicate Cleaner & Sorter',
    settingsLanguage: 'Sprache der Oberflache',
    languageLabel: 'Sprache',
    languageAuto: 'Automatisch',
    languageNameEn: 'Englisch',
    languageNameRu: 'Russisch',
    languageNameEs: 'Spanisch',
    languageNameFr: 'Franzosisch',
    languageNameDe: 'Deutsch',
    languageNameZh: 'Chinesisch',
    includeQueryParams: 'Query-Parameter berucksichtigen',
    includeHash: 'Hash-Fragmente berucksichtigen',
    ignoreTrailingSlash: '/page und /page/ als gleich behandeln',
    protectPinnedTabs: 'Angeheftete Tabs nicht schliessen oder verschieben',
    showOnlyDuplicateSites: 'Nur Websites mit Duplikaten anzeigen',
    allowGroupedDuplicateRemoval:
      'Duplikate innerhalb von Tab-Gruppen entfernen',
    rescanButton: 'Liste aktualisieren',
    closeAllDuplicatesButton: 'Alle Duplikate entfernen',
    sortCurrentWindowButton: 'Aktuelles Fenster sortieren',
    sortAllWindowsButton: 'Alle Fenster sortieren',
    groupSitesToWindowsButton: 'Websites auf Fenster verteilen',
    tabsPerWindowLimit: 'Tabs pro Fenster',
    statusScanning: 'Tabs werden gescannt...',
    statusNoSiteTabsToClose: 'Keine Website-Tabs zum Schliessen verfugbar.',
    statusPinnedCloseBlocked:
      'Das Schliessen eines angehefteten Tabs ist durch die aktuellen Einstellungen blockiert.',
    statusNoDuplicatesFound: 'Keine Duplikate zum Entfernen gefunden.',
    statusNoTabsForWindows: 'Keine Tabs zum Verteilen auf Fenster verfugbar.',
    confirmCloseSiteDuplicates: '{count} doppelte Tabs fur {site} entfernen?',
    confirmCloseSite: '{count} Tabs fur {site} schliessen?',
    confirmCloseAllDuplicates: '{count} doppelte Tabs entfernen?',
    confirmDistributeToWindows:
      '{windowsCount} Fenster erstellen und {tabsCount} Tabs verschieben?',
    summary:
      'Offene Tabs: {tabsCount}. Websites: {visibleSitesCount}/{totalSitesCount}. Zu entfernende Duplikate: {duplicateCount}.',
    noSitesForCurrentFilters:
      'Keine Websites entsprechen den aktuellen Filtern.',
    siteMeta:
      'Tabs: {tabsCount}. URL-Gruppen: {urlGroupsCount}. URLs mit Duplikaten: {duplicateUrlGroupsCount}. Entfernbar: {removableDuplicatesCount}.',
    closeSiteDuplicatesButton: 'Website-Duplikate entfernen',
    closeSiteButton: 'Website schliessen',
    untitledTab: 'Ohne Titel',
    badgeWindow: 'Fenster {windowId}',
    badgeDuplicate: 'Duplikat',
    badgeGrouped: 'in Gruppe',
    badgePinned: 'angeheftet',
    activateTabButton: 'Wechseln',
    closeTabButton: 'Schliessen',
    actionCloseDuplicates: 'Duplikate entfernen',
    actionCloseSiteTabs: 'Website-Tabs schliessen',
    actionCloseTab: 'Tab schliessen',
    actionActivateTabSuccess: 'Zum ausgewahlten Tab gewechselt.',
    actionActivateTabFailure: 'Wechsel zum ausgewahlten Tab fehlgeschlagen.',
    actionSortCurrentWindow: 'Aktuelles Fenster sortieren',
    actionSortAllWindows: 'Alle Fenster sortieren',
    actionMoveSitesToWindows: 'Websites auf Fenster verteilen',
    operationNoDuplicates: 'Keine Duplikate zum Entfernen gefunden.',
    operationNoSiteTabs: 'Keine Website-Tabs zum Entfernen verfugbar.',
    operationNoTabsForWindows:
      'Keine Tabs zum Verteilen auf Fenster verfugbar.',
    operationSuccess: '{actionLabel}: {count} verarbeitet.',
    operationFailure: '{actionLabel}: Vorgang konnte nicht ausgefuhrt werden.',
    operationPartialSuccess:
      '{actionLabel}: {successCount} verarbeitet, Fehler {failedCount}.'
  },
  zh: {
    appTitle: '打开的标签页',
    popupTitle: 'Tab Duplicate Cleaner & Sorter',
    settingsLanguage: '界面语言',
    languageLabel: '语言',
    languageAuto: '自动',
    languageNameEn: '英语',
    languageNameRu: '俄语',
    languageNameEs: '西班牙语',
    languageNameFr: '法语',
    languageNameDe: '德语',
    languageNameZh: '中文',
    includeQueryParams: '包含查询参数',
    includeHash: '包含哈希片段',
    ignoreTrailingSlash: '将 /page 和 /page/ 视为相同',
    protectPinnedTabs: '不要关闭或移动固定标签页',
    showOnlyDuplicateSites: '仅显示有重复项的网站',
    allowGroupedDuplicateRemoval: '删除标签组内的重复项',
    rescanButton: '刷新列表',
    closeAllDuplicatesButton: '删除所有重复项',
    sortCurrentWindowButton: '排序当前窗口',
    sortAllWindowsButton: '排序所有窗口',
    groupSitesToWindowsButton: '按窗口分配网站',
    tabsPerWindowLimit: '每个窗口标签数',
    statusScanning: '正在扫描标签页...',
    statusNoSiteTabsToClose: '没有可关闭的网站标签页。',
    statusPinnedCloseBlocked: '当前设置禁止关闭固定标签页。',
    statusNoDuplicatesFound: '未找到可删除的重复项。',
    statusNoTabsForWindows: '没有可分配到窗口的标签页。',
    confirmCloseSiteDuplicates: '删除 {site} 的 {count} 个重复标签页？',
    confirmCloseSite: '关闭 {site} 的 {count} 个标签页？',
    confirmCloseAllDuplicates: '删除 {count} 个重复标签页？',
    confirmDistributeToWindows:
      '创建 {windowsCount} 个窗口并移动 {tabsCount} 个标签页？',
    summary:
      '已打开标签页: {tabsCount}。网站: {visibleSitesCount}/{totalSitesCount}。待删除重复项: {duplicateCount}。',
    noSitesForCurrentFilters: '没有网站符合当前筛选条件。',
    siteMeta:
      '标签页: {tabsCount}。URL 组: {urlGroupsCount}。含重复项的 URL: {duplicateUrlGroupsCount}。可删除: {removableDuplicatesCount}。',
    closeSiteDuplicatesButton: '删除网站重复项',
    closeSiteButton: '关闭网站',
    untitledTab: '未命名',
    badgeWindow: '窗口 {windowId}',
    badgeDuplicate: '重复',
    badgeGrouped: '在组内',
    badgePinned: '已固定',
    activateTabButton: '转到',
    closeTabButton: '关闭',
    actionCloseDuplicates: '删除重复项',
    actionCloseSiteTabs: '关闭网站标签页',
    actionCloseTab: '关闭标签页',
    actionActivateTabSuccess: '已切换到所选标签页。',
    actionActivateTabFailure: '无法切换到所选标签页。',
    actionSortCurrentWindow: '排序当前窗口',
    actionSortAllWindows: '排序所有窗口',
    actionMoveSitesToWindows: '按窗口分配网站',
    operationNoDuplicates: '未找到可删除的重复项。',
    operationNoSiteTabs: '没有可删除的网站标签页。',
    operationNoTabsForWindows: '没有可分配到窗口的标签页。',
    operationSuccess: '{actionLabel}: 已处理 {count} 个。',
    operationFailure: '{actionLabel}: 操作未能完成。',
    operationPartialSuccess:
      '{actionLabel}: 已处理 {successCount} 个, 错误 {failedCount} 个。'
  }
};

export function createTranslator(language) {
  return (key, params = {}) => {
    const template =
      TRANSLATIONS[language]?.[key] ??
      TRANSLATIONS[DEFAULT_LANGUAGE]?.[key] ??
      key;

    return template.replaceAll(/\{(\w+)\}/g, (_, token) =>
      String(params[token] ?? `{${token}}`)
    );
  };
}

export function getLanguageChoices(t) {
  return [
    { value: AUTO_LANGUAGE, label: t('languageAuto') },
    { value: 'en', label: t('languageNameEn') },
    { value: 'ru', label: t('languageNameRu') },
    { value: 'es', label: t('languageNameEs') },
    { value: 'fr', label: t('languageNameFr') },
    { value: 'de', label: t('languageNameDe') },
    { value: 'zh', label: t('languageNameZh') }
  ];
}

export function resolveUiLanguage(setting, browserLanguages = []) {
  if (setting && setting !== AUTO_LANGUAGE) {
    return normalizeSupportedLanguage(setting);
  }

  for (const browserLanguage of browserLanguages) {
    const normalizedLanguage = normalizeSupportedLanguage(browserLanguage);

    if (SUPPORTED_LANGUAGES.includes(normalizedLanguage)) {
      return normalizedLanguage;
    }
  }

  return DEFAULT_LANGUAGE;
}

export function getBrowserLanguages() {
  return [...(navigator.languages ?? []), navigator.language].filter(Boolean);
}

function normalizeSupportedLanguage(language) {
  if (!language) {
    return DEFAULT_LANGUAGE;
  }

  const normalizedLanguage = language.toLowerCase().split(/[-_]/)[0];

  if (SUPPORTED_LANGUAGES.includes(normalizedLanguage)) {
    return normalizedLanguage;
  }

  return DEFAULT_LANGUAGE;
}
