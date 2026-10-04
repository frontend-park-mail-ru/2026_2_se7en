import { loadTemplate } from '../../helpers/LoadTemplate.js';
import { debugError } from '../../helpers/debugError.js';

let templates = {};

/** Загружает шаблон split-screen лейаута страниц авторизации. */
export async function loadAuthLayoutTemplate() {
  templates = await loadTemplate(templates, 'auth-layout');
}

/**
 * Генерирует split-screen разметку для страниц авторизации.
 * @param {Object} params Параметры лейаута.
 * @returns {string} HTML-разметка страницы.
 */
export function AuthLayout({ title, subtitle, topBar = '', children }) {
  if (!templates['auth-layout']) {
    debugError('Шаблон страницы авторизации ещё не загружен');
    return '';
  }

  return templates['auth-layout']({ title, subtitle, topBar, children });
}
