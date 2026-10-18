import { Page } from '@/pages/Page.ts';
import { router } from '@/helpers/Router.ts';

interface ShowPageOptions {
  replace?: boolean;
}

/**
 * Переключает страницу приложения через Router.
 */
export async function showPage(
  PageClass: typeof Page,
  options: ShowPageOptions = {},
): Promise<boolean> {
  const route = PageClass.route;

  if (!route) {
    throw new Error(`${PageClass.name} не объявляет маршрут`);
  }

  await router.go(route, options);
  return true;
}
