import { Page } from '@/pages/Page.ts';

export type PageConstructor = typeof Page;

export interface Route {
  path: string;
  page: PageConstructor;
  /** Страница только для неавторизованных */
  guestOnly?: boolean;
  /** Страница только для авторизованных */
  requiresAuth?: boolean;
}

export interface NavigateOptions {
  /** Заменить текущую запись в истории вместо добавления новой */
  replace?: boolean;
}

export class Router {
  private static instance: Router;
  private routes: Route[] = [];
  private currentPage: Page | null = null;
  private isAuthCheck: (() => Promise<boolean>) | null = null;

  constructor() {
    if (Router.instance) {
      return Router.instance;
    }
    Router.instance = this;
  }

  /**
   * Добавление маршрута в роутер (цепочкой .use().use())
   */
  use(
    path: string,
    page: PageConstructor,
    meta: { guestOnly?: boolean; requiresAuth?: boolean } = {},
  ): this {
    this.routes.push({
      path,
      page,
      ...meta,
    });
    return this;
  }

  /**
   * Функция для проверки статуса авторизации перед переходом
   */
  setAuthCheck(checkFn: () => Promise<boolean>): this {
    this.isAuthCheck = checkFn;
    return this;
  }

  /**
   * Переход по URL
   */
  async go(pathname: string, options: NavigateOptions = {}): Promise<void> {
    const isAuth = this.isAuthCheck ? await this.isAuthCheck() : false;
    let targetPath = pathname.replace(/\/+$/, '') || '/';

    if (targetPath === '/') {
      targetPath = isAuth ? '/chats' : '/login';
      options.replace = true;
    }

    const matchedRoute = this.routes.find((route) => route.path === targetPath);

    if (matchedRoute?.guestOnly && isAuth) {
      return this.go('/chats', { replace: true });
    }

    if (matchedRoute?.requiresAuth && !isAuth) {
      return this.go('/login', { replace: true });
    }

    if (options.replace) {
      window.history.replaceState({}, '', targetPath);
    } else {
      window.history.pushState({}, '', targetPath);
    }

    await this.renderRoute(targetPath);
  }

  /**
   * Назад по истории
   */
  back(): void {
    window.history.back();
  }

  /**
   * Вперёд по истории
   */
  forward(): void {
    window.history.forward();
  }

  /**
   * Запуск роутера и навешивание событий
   */
  start(): void {
    window.addEventListener('popstate', () => {
      void this.go(window.location.pathname, { replace: true });
    });

    document.addEventListener('click', (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) {
        return;
      }

      event.preventDefault();
      void this.go(href);
    });

    void this.go(window.location.pathname, { replace: true });
  }

  /**
   * Отрисовка страницы по пути
   */
  private async renderRoute(pathname: string): Promise<void> {
    const normalized = pathname.replace(/\/+$/, '') || '/';
    const route = this.routes.find((r) => r.path === normalized);

    if (!route) return this.go('/chats', { replace: true });

    if (this.currentPage) this.currentPage.unmount();

    const PageClass = route.page;
    this.currentPage = new PageClass();
    await this.currentPage.mount();
  }
}

export const router = new Router();
