import { Page } from '@/pages/Page.ts';

export type PageConstructor = typeof Page;

export interface Route {
  path: string;
  page: PageConstructor;
  guestOnly?: boolean;
  requiresAuth?: boolean;
}

export interface NavigateOptions {
  replace?: boolean;
}

export class Router {
  private static instance: Router;
  private routes: Route[] = [];
  private currentPage: Page | null = null;

  private isAuth: boolean = false;

  constructor() {
    if (Router.instance) {
      return Router.instance;
    }
    Router.instance = this;
  }

  /** Задает статус авторизации в роутере */
  setAuthState(isAuth: boolean): this {
    this.isAuth = isAuth;
    return this;
  }

  use(
    path: string,
    page: PageConstructor,
    meta: { guestOnly?: boolean; requiresAuth?: boolean } = {},
  ): this {
    this.routes.push({ path, page, ...meta });
    return this;
  }

  /**
   * Переход по URL
   */
  async go(pathname: string, options: NavigateOptions = {}): Promise<void> {
    let targetPath = pathname.replace(/\/+$/, '') || '/';

    if (targetPath === '/') {
      targetPath = this.isAuth ? '/chats' : '/login';
      options.replace = true;
    }

    const route = this.routes.find((r) => r.path === targetPath);

    if (route?.requiresAuth && !this.isAuth) {
      return this.go('/login', { replace: true });
    }

    if (route?.guestOnly && this.isAuth) {
      return this.go('/chats', { replace: true });
    }

    if (!route) {
      return this.go('/chats', { replace: true });
    }

    if (window.location.pathname === targetPath && this.currentPage instanceof route.page) {
      return;
    }

    if (options.replace) {
      window.history.replaceState({}, '', targetPath);
    } else {
      window.history.pushState({}, '', targetPath);
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
}

export const router = new Router();
