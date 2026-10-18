import { Page } from '@/pages/Page.ts';

export type PageConstructor = typeof Page;

/** Конфигурация одного маршрута. */
export interface Route {
  /** URL-путь, например `/chats`. */
  path: string;
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
 * SPA-роутер
 *
 * Задачи:
 * - Регистрирование маршрутов с мета-информацией (`requiresAuth`, `guestOnly`).
 * - Переключение страницы без полной перезагрузки.
 * - Перехватывание кликов по внутренним ссылкам (`<a href="/...">`).
 * - Работа с кнопками «Назад/Вперёд» браузера (`popstate`).
 *
 * @example
 *   router
 *     .use('/chats', ChatsPage, { requiresAuth: true })
 *     .use('/login', LoginPage, { guestOnly: true });
 *
 *   router.setAuthState(true);
 *   router.start();
 */
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

  /**
   * Устанавливает статус авторизации пользователя.
   * Используется `requiresAuth` и `guestOnly` при навигации.
   *
   * @param isAuth `true`, если пользователь авторизован.
   * @returns Текущий экземпляр роутера (для чейнинга).
   *
   * @example
   *   router.setAuthState(false);
   */
  setAuthState(isAuth: boolean): this {
    this.isAuth = isAuth;
    return this;
  }

  /**
   * Регистрирует маршрут.
   *
   * @param path URL-путь (должен начинаться с `/`).
   * @param page Класс страницы-наследника `Page`.
   * @param meta Мета-данные маршрута: `guestOnly` или `requiresAuth`.
   * @returns Текущий экземпляр роутера (для чейнинга).
   *
   * @example
   *   router.use('/login', LoginPage, { guestOnly: true });
   */
  use(
    path: string,
    page: PageConstructor,
    meta: { guestOnly?: boolean; requiresAuth?: boolean } = {},
  ): this {
    this.routes.push({ path, page, ...meta });
    return this;
  }

  /**
   * Переходит на указанный путь.
   *
   * Логика:
   * 1. Если путь `/` — редиректит на `/chats` (авторизован) или `/login` (гость).
   * 2. Проверяет: если `requiresAuth` и не авторизован → на `/login`;
   *    если `guestOnly` и авторизован → на `/chats`.
   * 3. Если маршрут не найден → на `/chats` (или `/login`, если гость).
   * 4. Если уже на этом маршруте и та же страница — ничего не делает.
   * 5. Размонтирует текущую страницу, создаёт и монтирует новую.
   *
   * @param pathname Целевой путь (например, `/login`).
   * @param options Опции навигации (`replace`).
   * @returns Промис, который резолвится после монтирования страницы.
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

  /**
   * Запускает роутер.
   *
   * Устанавливает глобальные слушатели:
   * - `popstate` — кнопки «Назад/Вперёд» в браузере.
   * - `click` на `document` — перехват кликов по внутренним ссылкам `<a href="/...">`.
   *
   * Внешние ссылки (начинающиеся с `http://`, `https://`, `//`) и якоря (`#`)
   * не перехватываются.
   *
   * После установки слушателей выполняет первичную навигацию на текущий URL.
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
}

/**
 * Единственный экземпляр роутера на всё приложение.
 * Импортировать его.
 */
export const router = new Router();
