/**
 * Переключает страницу без полной перезагрузки приложения.
 *
 * @param {typeof import('./pages/Page.js').Page} PageClass Класс целевой страницы.
 * @param {{ replace?: boolean }} options Тип изменения истории браузера.
 * @returns {Promise<boolean>} Результат монтирования страницы.
 */
export async function showPage(PageClass, { replace = false } = {}) {
  const route = PageClass.route;
  if (!route) {
    throw new Error(`${PageClass.name} не объявляет маршрут`);
  }

  if (window.location.pathname !== route) {
    const updateHistory = replace ? 'replaceState' : 'pushState';
    window.history[updateHistory]({}, '', route);
  }

  const page = new PageClass();
  return page.mount();
}
