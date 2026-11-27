import './DefaultLayout.scss';
import { BottomTabBar } from '@/components/core/BottomTabBar.ts';
import { Sidebar } from '@/components/core/Sidebar.js';

/**
 * Базовый лейаут приложения с боковой панелью Sidebar
 * и мобильной нижней панелью навигации BottomTabBar.
 */
export class DefaultLayout {
  private readonly sidebar: Sidebar;
  private readonly bottomBar: BottomTabBar;

  constructor() {
    this.sidebar = new Sidebar();
    this.bottomBar = new BottomTabBar();
  }

  /**
   * Рендерит общий контейнер страницы.
   *
   * @param contentHtml HTML-строка контента конкретной страницы.
   * @returns Итоговая разметка страницы в лейауте.
   */
  render(contentHtml: string, modifier = ''): string {
    return `
      <div class="layout${modifier ? ` ${modifier}` : ''}">
        ${this.sidebar.render()}
        ${contentHtml}
        ${this.bottomBar.render()}
      </div>
    `;
  }

  bindEvents(): void {
    this.sidebar.bindEvents();
    this.bottomBar.bindEvents();
  }

  unmount(): void {
    this.sidebar.unbindEvents();
    this.bottomBar.unbindEvents();
  }
}
