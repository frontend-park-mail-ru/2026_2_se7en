import './BottomTabBar.scss';
import { ROUTES } from '@/constants/Routes.ts';
import { router } from '@/helpers/Router.ts';
import { user } from '@/store/User';
import { ChatsIcon, ContactsIcon, LogoutIcon, UserIcon } from '@/components/core/Icons.ts';

const BAR_ID = 'bottom-bar';
const TOGGLE_ID = 'bottom-bar-profile-toggle';
const MENU_OPEN_CLASS = 'bottom-bar_menu-open';
const CONFIRM_OPEN_CLASS = 'bottom-bar_confirm-open';

/**
 * Нижняя панель навигации мобильной версии: Чаты, Контакты и Профиль
 * с поповером. На десктопе скрыта CSS-ом; показывается
 * только на экранах списка чатов, контактов и пользователей
 */
export class BottomTabBar {
  private outsideBound = false;

  render(): string {
    return `
      <nav class="bottom-bar" id="${BAR_ID}" aria-label="Основная навигация">
        <a href="${ROUTES.HOME}" class="bottom-bar__tab bottom-bar__tab_chats">
          ${ChatsIcon}
          <span>Чаты</span>
        </a>
        <a href="${ROUTES.CONTACTS}" class="bottom-bar__tab bottom-bar__tab_contacts">
          ${ContactsIcon}
          <span>Контакты</span>
        </a>
        <button type="button" class="bottom-bar__tab bottom-bar__tab_profile" id="${TOGGLE_ID}" aria-haspopup="menu" aria-expanded="false">
          ${UserIcon}
          <span>Профиль</span>
        </button>
        <div class="bottom-bar__menu" role="menu" aria-label="Меню профиля">
          <a href="${ROUTES.PROFILE_MENU}" class="bottom-bar__menu-item" role="menuitem" data-menu-close>
            Профиль
          </a>
          <button type="button" class="bottom-bar__menu-item" role="menuitem" data-logout-open>
            ${LogoutIcon}
            Выход
          </button>
        </div>
        <div class="bottom-bar__modal-backdrop" data-logout-cancel role="presentation"></div>
        <div class="bottom-bar__modal" role="dialog" aria-modal="true" aria-labelledby="logout-confirm-title">
          <h3 id="logout-confirm-title">Выйти из аккаунта?</h3>
          <p>Вы покинете приложение и вернётесь на экран входа.</p>
          <div class="bottom-bar__modal-actions">
            <button type="button" class="bottom-bar__modal-cancel" data-logout-cancel>Отмена</button>
            <button type="button" class="bottom-bar__modal-confirm" data-logout-confirm>Выйти</button>
          </div>
        </div>
      </nav>
    `;
  }

  bindEvents(): void {
    document.getElementById(BAR_ID)?.addEventListener('click', this.handleBarClick);

    if (!this.outsideBound) {
      document.addEventListener('click', this.handleOutsideClick);
      this.outsideBound = true;
    }
  }

  unbindEvents(): void {
    document.removeEventListener('click', this.handleOutsideClick);
    this.outsideBound = false;
  }

  private readonly handleBarClick = (event: MouseEvent): void => {
    const bar = document.getElementById(BAR_ID);
    const target = event.target as Element | null;
    if (!bar || !target) {
      return;
    }

    if (target.closest('[data-logout-confirm]')) {
      void this.confirmLogout(bar);
      return;
    }

    if (target.closest('[data-logout-cancel]')) {
      bar.classList.remove(CONFIRM_OPEN_CLASS);
      return;
    }

    if (target.closest(`#${TOGGLE_ID}`)) {
      const isOpen = bar.classList.toggle(MENU_OPEN_CLASS);
      bar.querySelector(`#${TOGGLE_ID}`)?.setAttribute('aria-expanded', String(isOpen));
      return;
    }

    if (target.closest('[data-logout-open]')) {
      bar.classList.remove(MENU_OPEN_CLASS);
      bar.classList.add(CONFIRM_OPEN_CLASS);
      return;
    }

    if (target.closest('.bottom-bar__tab, .bottom-bar__menu-item')) {
      this.closeMenu(bar);
    }
  };

  private readonly handleOutsideClick = (event: MouseEvent): void => {
    const bar = document.getElementById(BAR_ID);
    const target = event.target as Element | null;
    if (!bar || !bar.classList.contains(MENU_OPEN_CLASS)) {
      return;
    }
    if (target?.closest(`#${BAR_ID}`)) {
      return;
    }
    this.closeMenu(bar);
  };

  private closeMenu(bar: HTMLElement): void {
    bar.classList.remove(MENU_OPEN_CLASS);
    bar.querySelector(`#${TOGGLE_ID}`)?.setAttribute('aria-expanded', 'false');
  }

  private async confirmLogout(bar: HTMLElement): Promise<void> {
    const confirmButton = bar.querySelector<HTMLButtonElement>('[data-logout-confirm]');
    if (confirmButton) {
      confirmButton.disabled = true;
    }

    await user.logout();
    void router.goTo(ROUTES.LOGIN, { replace: true });
  }
}
