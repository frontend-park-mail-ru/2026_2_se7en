import { Page } from '@/pages/Page';

/**
 * Переключает страницу приложения без полной перезагрузки.
 */
export async function showPage(PageClass: typeof Page): Promise<boolean> {
  const route = PageClass.route;

  if (!route) {
    throw new Error(`${PageClass.name} не объявляет маршрут`);
  }

  if (window.location.pathname !== route) {
    window.history.pushState({}, '', route);
  }

  return new PageClass().mount();
}
