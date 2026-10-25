import { APP_ID } from '@/constants/App.ts';
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

    this.container.innerHTML = await this.render();

    this.bindEvents();
    await this.afterMount();

    return true;
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
