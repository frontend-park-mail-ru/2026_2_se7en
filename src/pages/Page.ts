import { APP_ID } from '@/constants/App.ts';
import { DefaultLayout } from '@/layouts/DefaultLayout.ts';
import { Signal } from '@/reactive/Signal';
import { debugError } from '@/helpers/DebugError.ts';

let mountedPage: Page | null = null;

/**
 * Базовый класс всех страниц приложения.
 * Управляет контейнером, рендерингом и жизненным циклом страницы.
 */
export class Page {
  static route?: string;
  protected container: HTMLElement | null;

  constructor() {
    this.container = null;
  }

  /**
   * Инициализирует страницу и монтирует её в DOM.
   */
  async mount(): Promise<boolean> {
    if (mountedPage && mountedPage !== this) {
      mountedPage.unmount();
    }

    this.container = document.getElementById(APP_ID);

    if (!this.container) {
      debugError(`Элемент с id ${APP_ID} не найден`);
      return false;
    }

    mountedPage = this;

    const rendered = this.render();
    const html = typeof rendered === 'string' ? rendered : await rendered;
    if (mountedPage !== this) return false;
    this.replaceContent(html);

    this.bindEvents();
    await this.afterMount();

    return true;
  }

  /**
   * Подписывает сигналы страницы на функцию-наблюдатель.
   *
   * @param signals Сигналы, при изменении которых вызывается наблюдатель.
   * @param watcher Функция, вызываемая при изменении любого сигнала.
   */
  protected setSubscribers(signals: Signal<unknown>[], watcher: () => unknown): void {
    signals.forEach((signal) => signal.subscribe(watcher));
  }

  protected replaceContent(html: string): void {
    if (this.container) DefaultLayout.update(this.container, html);
  }

  render(): string | Promise<string> {
    return '';
  }

  bindEvents(): void {}

  async afterMount(): Promise<void> {}

  unmount(): void {
    this.container = null;

    if (mountedPage === this) {
      mountedPage = null;
    }
  }
}
