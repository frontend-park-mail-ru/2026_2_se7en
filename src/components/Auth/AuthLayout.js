import { loadTemplate } from '../../helpers/LoadTemplate.js';

let templates = {};

/**
 * Генерирует split-screen разметку для страниц авторизации.
 *
 * @param {Object} params
 * @returns {Promise<string>}
 */
export async function AuthLayout({ title, subtitle, topBar = '', children }) {
  templates = await loadTemplate(templates, 'auth-layout');
  return templates['auth-layout']({ title, subtitle, topBar, children });
}
