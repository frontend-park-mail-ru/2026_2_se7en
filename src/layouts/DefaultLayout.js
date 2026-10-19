import { Sidebar } from '@/components/core/Sidebar.js';

/**
 * Базовый лейаут приложения с боковой панелью Sidebar.
 */
export class DefaultLayout {
  constructor() {
    this.sidebar = new Sidebar();
  }

  /**
   * Рендерит общий контейнер страницы.
   *
   * @param {string} contentHtml HTML-строка контента конкретной страницы.
   * @returns {string} Итоговая разметка страницы в лейауте.
   */
  render(contentHtml) {
    return `
      <div class="min-h-screen bg-gray-50 flex">
        ${this.sidebar.render()}
        ${contentHtml}
      </div>
    `;
  }

  bindEvents() {
    this.sidebar.bindEvents();
  }

  unmount() {
    if (this.sidebar.unbindEvents) {
      this.sidebar.unbindEvents();
    }
  }
}
