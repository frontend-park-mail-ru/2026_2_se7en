import './DefaultLayout.scss';
import { Sidebar } from '@/components/core/Sidebar.js';

/**
 * Базовый лейаут приложения с боковой панелью Sidebar.
 */
export class DefaultLayout {
  private readonly sidebar: Sidebar;

  constructor() {
    this.sidebar = new Sidebar();
  }

  /**
   * Рендерит общий контейнер страницы.
   *
   * @param contentHtml HTML-строка контента конкретной страницы.
   * @returns Итоговая разметка страницы в лейауте.
   */
  render(contentHtml: string): string {
    return `
      <div class="layout">
        ${this.sidebar.render()}
        ${contentHtml}
      </div>
    `;
  }

  bindEvents(): void {
    this.sidebar.bindEvents();
  }

  unmount(): void {
    this.sidebar.unbindEvents();
  }
}
