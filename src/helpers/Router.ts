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
 *
 * Отвечает за навигацию, URL и монтирование страниц.
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
 *   router.setAuthCheck(() => user.isAuth);
 *   router.start();
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

  /**
   * Устанавливает функцию проверки авторизации.
   * Используется `requiresAuth` и `guestOnly` при навигации.
   *
   * @param checkFn Функция, возвращающая текущий статус авторизации.
   * @returns Текущий экземпляр роутера (для чейнинга).
   */
  setAuthCheck(checkFn: () => boolean): this {
    this.checkAuth = checkFn;
    return this;
  }

  /**
   * Регистрирует маршрут.
   *
   * @param path URL-путь или регулярное выражение.
   * @param page Класс страницы-наследника `Page`.
   * @param meta Мета-данные маршрута: `guestOnly` или `requiresAuth`.
   * @returns Текущий экземпляр роутера (для чейнинга).
   *
   * @example
   *   router.use('/login', LoginPage, { guestOnly: true });
   */
  use(
    path: string | RegExp,
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

/**
 * Единственный экземпляр роутера на всё приложение.
 * Импортировать его.
 */
export const router = new Router();
