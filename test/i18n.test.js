import test from 'node:test';
import assert from 'node:assert/strict';

import { createTranslator, resolveUiLanguage } from '../lib/i18n.js';

test('resolveUiLanguage returns supported explicit language', () => {
  assert.equal(resolveUiLanguage('ru', ['en-US']), 'ru');
  assert.equal(resolveUiLanguage('zh-CN', ['en-US']), 'zh');
});

test('resolveUiLanguage uses browser language when auto is selected', () => {
  assert.equal(resolveUiLanguage('auto', ['fr-CA', 'en-US']), 'fr');
  assert.equal(resolveUiLanguage(undefined, ['de-DE']), 'de');
});

test('resolveUiLanguage falls back to english for unsupported languages', () => {
  assert.equal(resolveUiLanguage('it', ['ru-RU']), 'en');
  assert.equal(resolveUiLanguage('auto', ['it-IT', 'pt-BR']), 'en');
});

test('createTranslator falls back to english keys when translation is missing', () => {
  const t = createTranslator('ru');

  assert.equal(t('appTitle'), 'Открытые ссылки');
  assert.equal(
    t('summary', {
      tabsCount: 5,
      visibleSitesCount: 2,
      totalSitesCount: 4,
      duplicateCount: 1
    }),
    'Открыто вкладок: 5. Сайтов: 2/4. Дубликатов к удалению: 1.'
  );
});
