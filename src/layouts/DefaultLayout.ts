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
  render(contentHtml: string, modifier = ''): string {
    return `
      <div class="layout${modifier ? ` ${modifier}` : ''}">
        ${this.sidebar.render()}
        ${contentHtml}
      </div>
    `;
  }

  static update(container: HTMLElement, html: string): void {
    const current = container.querySelector(':scope > .layout');
    const sidebar = current?.querySelector(':scope > .sidebar');
    if (!current || !sidebar) {
      container.innerHTML = html;
      return;
    }

    const template = document.createElement('template');
    template.innerHTML = html;
    const next = template.content.firstElementChild;
    const nextSidebar = next?.querySelector(':scope > .sidebar');
    if (!next || !nextSidebar) {
      container.replaceChildren(template.content);
      return;
    }

    current.className = next.className;
    const nextLinks = nextSidebar.querySelectorAll('.sidebar__nav-item');
    sidebar.querySelectorAll('.sidebar__nav-item').forEach((link, index) => {
      const active = nextLinks[index]?.hasAttribute('aria-current') ?? false;
      link.classList.toggle('sidebar__nav-item_active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    const avatar = sidebar.querySelector('.sidebar__avatar-letter');
    if (avatar)
      avatar.textContent = nextSidebar.querySelector('.sidebar__avatar-letter')?.textContent ?? '';

    for (const node of [...current.childNodes]) {
      if (node !== sidebar) node.remove();
    }
    nextSidebar.remove();
    current.append(...next.childNodes);
  }

  bindEvents(): void {
    this.sidebar.bindEvents();
  }

  unmount(): void {
    this.sidebar.unbindEvents();
  }
}
