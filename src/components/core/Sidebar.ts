import './Sidebar.scss';
import { Button } from '@/components/core/Button.js';
import { ROUTES } from '@/constants/Routes.ts';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';
import { router } from '@/helpers/Router.ts';
import { user } from '@/store/User';

/** Компонент боковой панели навигации. */
export class Sidebar {
  render(): string {
    const firstLetter =
      Array.from(String(user.getName() || '').trim())[0]?.toLocaleUpperCase('ru-RU') || '?';
    const safeFirstLetter = escapeHtml(firstLetter);
    const logoutIcon = `
      <svg aria-hidden="true" class="icon icon--md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4m4-4 4-4-4-4m4 4H9" />
      </svg>
    `;

    return `
      <aside class="sidebar">
        <div class="sidebar__logo-box">
          <div class="sidebar__logo">
            <img src="/pictures/icon.png" alt="Логотип" class="sidebar__logo-img">
          </div>
        </div>

        <nav class="sidebar__nav">
          <button class="sidebar__nav-item sidebar__nav-item--active">
            <svg class="icon icon--lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span class="sidebar__nav-label">Чаты</span>
          </button>

          <button class="sidebar__nav-item">
            <svg class="icon icon--lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span class="sidebar__nav-label">Контакты</span>
          </button>
        </nav>

        <div class="sidebar__bottom">
          ${Button({
            id: 'logout-button',
            text: '',
            type: 'button',
            mode: 'ghost',
            ariaLabel: 'Выйти из аккаунта',
            title: 'Выйти',
            iconBefore: logoutIcon,
            className: 'button--icon',
          })}
          <div class="sidebar__avatar-box">
            <div class="sidebar__avatar">
              <span class="sidebar__avatar-letter">${safeFirstLetter}</span>
            </div>
            <div class="sidebar__status"></div>
          </div>
        </div>
      </aside>
    `;
  }

  bindEvents(): void {
    document.getElementById('logout-button')?.addEventListener('click', this.handleLogout);
  }

  handleLogout = async (event: MouseEvent): Promise<void> => {
    const btn = event.currentTarget;

    if (btn instanceof HTMLButtonElement) btn.disabled = true;

    await user.logout();
    void router.goTo(ROUTES.LOGIN, { replace: true });
  };

  unbindEvents(): void {
    document.getElementById('logout-button')?.removeEventListener('click', this.handleLogout);
  }
}
