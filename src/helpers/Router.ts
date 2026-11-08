import { Page } from '@/pages/Page.ts';
import { ROUTES } from '@/constants/Routes.ts';

export type PageConstructor = typeof Page;

/** Конфигурация одного маршрута. */
export interface Route {
  /** URL-путь (строка или регулярное выражение, например `/chats`). */
  path: string | RegExp;
  /** Класс страницы, который нужно отрендерить для этого пути. */
  page: PageConstructor;
  /** Если `true` — страница доступна только неавторизованным. */
  guestOnly?: boolean;
  /** Если `true` — страница доступна только авторизованным. */
  requiresAuth?: boolean;
}

/** Опции навигации. */
export interface NavigateOptions {
  /** Заменить текущую запись в истории вместо добавления новой. */
  replace?: boolean;
}

/**
 * SPA-роутер.
 */
export class Router {
  private static instance: Router;
  private routes: Route[] = [];
  private currentPage: Page | null = null;
  private checkAuth: () => boolean = () => false;

  constructor() {
    Router.instance ??= this;
    return Router.instance;
  }

  private isCurrentPageOfType(page: PageConstructor): boolean {
    return this.currentPage instanceof page;
  }

  setAuthCheck(checkFn: () => boolean): this {
    this.checkAuth = checkFn;
    return this;
  }

  use(
    path: string | RegExp,
    page: PageConstructor,
    meta: { guestOnly?: boolean; requiresAuth?: boolean } = {},
  ): this {
    this.routes.push({ path, page, ...meta });
    return this;
  }

  async goTo(pathname: string, options: NavigateOptions = {}): Promise<void> {
    const isAuth = this.checkAuth();
    let targetPath = pathname.replace(/\/+$/, '') || '/';

    if (targetPath === '/') {
      targetPath = isAuth ? ROUTES.HOME : ROUTES.LOGIN;
      options.replace = true;
    }

    const route = this.routes.find((r) =>
      r.path instanceof RegExp ? r.path.test(targetPath) : r.path === targetPath,
    );

    if (route?.requiresAuth && !isAuth) {
      return this.goTo(ROUTES.LOGIN, { replace: true });
    }

    if (!route || (route?.guestOnly && isAuth)) {
      return this.goTo(ROUTES.HOME, { replace: true });
    }

    if (window.location.pathname === targetPath && this.isCurrentPageOfType(route.page)) {
      return;
    }

    if (options.replace) {
      window.history.replaceState({}, '', targetPath);
    } else {
      window.history.pushState({}, '', targetPath);
    }

    if (this.isCurrentPageOfType(route.page)) {
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }

    if (this.currentPage) {
      this.currentPage.unmount();
    }

    const PageClass = route.page;
    this.currentPage = new PageClass();
    await this.currentPage.mount();
  }

  start(): void {
    window.addEventListener('popstate', () => {
      void this.goTo(window.location.pathname, { replace: true });
    });

    document.addEventListener('click', (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      const ignoredPrefixes = ['http', '//', '#'];

      if (!href || ignoredPrefixes.some((prefix) => href.startsWith(prefix))) {
        return;
      }

      event.preventDefault();
      void this.goTo(href);
    });

    void this.goTo(window.location.pathname, { replace: true });
  }
}

export const router = new Router();
