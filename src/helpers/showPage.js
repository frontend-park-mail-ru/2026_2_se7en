/**
 * Переключает страницу приложения без полной перезагрузки.
 * @param {typeof import('../pages/Page.js').Page} PageClass Класс целевой страницы.
 * @returns {Promise<boolean>} Результат монтирования страницы.
 */
export async function showPage(PageClass) {
  const route = PageClass.route;
  if (!route) {
    throw new Error(`${PageClass.name} не объявляет маршрут`);
  }

  if (window.location.pathname !== route) {
    window.history.pushState({}, '', route);
  }

  return new PageClass().mount();
}
