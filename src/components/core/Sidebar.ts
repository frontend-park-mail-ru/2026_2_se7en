import './Sidebar.scss';
import { Button } from '@/components/core/Button.js';
import { ROUTES } from '@/constants/Routes.ts';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';
import { router } from '@/helpers/Router.ts';
import { user } from '@/store/User';
import { ChatsIcon, ContactsIcon, LogoutIcon } from '@/components/core/Icons.js';

/** Компонент боковой панели навигации. */
export class Sidebar {
  render(): string {
    const activeRoute = window.location.pathname;
    const firstLetter =
      Array.from(String(user.getName() || '').trim())[0]?.toLocaleUpperCase('ru-RU') || '?';
    const safeFirstLetter = escapeHtml(firstLetter);

    const isChatsActive = activeRoute === ROUTES.HOME;
    const isContactsActive = activeRoute === ROUTES.CONTACTS;

    return `
      <aside class="sidebar">
        <div class="sidebar__logo-box">
          <a href="${ROUTES.HOME}" class="sidebar__logo" aria-label="На главную">
            <img src="/pictures/icon.png" alt="Логотип" class="sidebar__logo-img">
          </a>
        </div>

        <nav class="sidebar__nav">
          <a href="${ROUTES.HOME}" class="sidebar__nav-item${isChatsActive ? ' sidebar__nav-item_active' : ''}"${isChatsActive ? ' aria-current="page"' : ''}>
            ${ChatsIcon}
            <span class="sidebar__nav-label">Чаты</span>
          </a>

          <a href="${ROUTES.CONTACTS}" class="sidebar__nav-item${isContactsActive ? ' sidebar__nav-item_active' : ''}"${isContactsActive ? ' aria-current="page"' : ''}>
            ${ContactsIcon}
            <span class="sidebar__nav-label">Контакты</span>
          </a>
        </nav>

        <div class="sidebar__bottom">
          ${Button({
            id: 'logout-button',
            text: '',
            type: 'button',
            mode: 'ghost',
            ariaLabel: 'Выйти из аккаунта',
            title: 'Выйти',
            iconBefore: LogoutIcon,
            className: 'button_icon',
          })}
          <a href="${ROUTES.PROFILE_SECURITY}" class="sidebar__avatar-box" aria-label="Профиль" title="Профиль">
            <div class="sidebar__avatar">
              <span class="sidebar__avatar-letter">${safeFirstLetter}</span>
            </div>
            <div class="sidebar__status"></div>
          </a>
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
