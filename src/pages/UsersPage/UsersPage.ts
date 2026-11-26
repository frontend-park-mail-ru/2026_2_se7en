import './UsersPage.scss';
import '@/components/contacts/ContactDialog.scss';
import '@/components/contacts/ContactsList.scss';
import { ApiError } from '@/api/ApiResponse.ts';
import { Button } from '@/components/core/Button.ts';
import { ContactsApi } from '@/api/contacts/ContactsApi.ts';
import { DefaultLayout } from '@/layouts/DefaultLayout.ts';
import { Page } from '@/pages/Page.ts';
import { PanelSearch } from '@/components/core/PanelSearch.ts';
import { ROUTES } from '@/constants/Routes.ts';
import type { UserSearchItem } from '@/api/users/users.types.ts';
import { UsersPageModel } from '@/pages/UsersPage/UsersPage.model.ts';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';
import { eventBus } from '@/helpers/EventBus.ts';
import { getChatInitials } from '@/helpers/chat.ts';
import {
  PublicProfileModal,
  type PublicProfileView,
} from '@/components/profile/PublicProfileModal.ts';

export class UsersPage extends Page {
  static route = ROUTES.USERS;

  private readonly model = new UsersPageModel();
  private readonly layout = new DefaultLayout();
  private searchTimer: number | null = null;
  private publicProfile: PublicProfileView | null = null;

  constructor() {
    super();
    this.setSubscribers(
      [
        this.model.users,
        this.model.isLoading,
        this.model.isLoadingMore,
        this.model.hasError,
        this.model.nextOffset,
      ],
      () => this.update(),
    );
  }

  render(): string {
    const users = this.model.users.value;
    const countLabel = `Показано: ${users.length}`;
    return this.layout.render(
      `
        <main class="users-page">
          <section class="contacts-list users-list" aria-label="Пользователи">
            <header class="contacts-list__header users-list__header">
              <div>
                <h2 class="contacts-list__title">Пользователи</h2>
                <p class="users-list__hint">Найдите пользователя по никнейму</p>
              </div>
            </header>
            <div class="contacts-list__search">${PanelSearch({ label: 'Поиск пользователей по никнейму', placeholder: 'Введите никнейм', value: this.model.query, name: 'user-search' })}</div>
            ${users.length ? `<p class="contacts-list__count">${countLabel}</p>` : ''}
            <div class="contacts-list__items" data-user-list>
              ${this.renderItems()}
            </div>
          </section>
          <section class="contact-dialog users-page__detail" aria-label="Профиль пользователя">
            <div class="contact-dialog__placeholder">
              <h2 class="contact-dialog__title">Поиск пользователей</h2>
              <p class="contact-dialog__text">Введите никнейм или его часть. Вы сможете открыть профиль и добавить человека в контакты.</p>
            </div>
          </section>
        </main>
        ${PublicProfileModal(this.publicProfile)}
      `,
      'layout_messenger layout_users',
    );
  }

  private renderItems(): string {
    const query = this.model.query;
    const users = this.model.users.value;
    if (this.model.isLoading.value && users.length === 0) {
      return '<p class="contacts-list__message" role="status">Ищем пользователей…</p>';
    }
    if (this.model.hasError.value) {
      return `<div class="contacts-list__message"><p>Не удалось загрузить пользователей.</p>${Button({ text: 'Попробовать ещё раз', mode: 'ghost', attrs: { 'data-users-retry': '' } })}</div>`;
    }
    if (!query) {
      return '<p class="contacts-list__message">Начните вводить никнейм, чтобы найти пользователей.</p>';
    }
    if (users.length === 0) {
      return '<p class="contacts-list__message">Пользователи не найдены</p>';
    }
    return `${users.map((item) => this.renderUser(item)).join('')}${this.model.nextOffset.value !== null ? Button({ text: this.model.isLoadingMore.value ? 'Загружаем…' : 'Загрузить ещё', mode: 'ghost', className: 'users-list__more', disabled: this.model.isLoadingMore.value, attrs: { 'data-users-more': '' } }) : ''}`;
  }

  private renderUser(item: UserSearchItem): string {
    const fullName = [item.first_name, item.last_name].filter(Boolean).join(' ');
    const displayName = fullName || item.nickname;
    const initials = getChatInitials(displayName);
    return `<div class="contact-item-row"><button type="button" class="button button_ghost contact-item users-list__user" data-open-user="${escapeHtml(item.user_id)}" aria-label="Открыть профиль ${escapeHtml(displayName)}">
      <span class="contact-item__avatar-box"><span class="contact-item__avatar">${item.icon_url ? `<img src="${escapeHtml(item.icon_url)}" alt="">` : escapeHtml(initials)}</span>${item.is_online ? '<span class="contact-item__online"></span>' : ''}</span>
      <span class="contact-item__details"><span class="contact-item__name">${escapeHtml(displayName)}</span><span class="contact-item__status">@${escapeHtml(item.nickname)}${item.is_contact ? ' · уже в контактах' : ''}</span></span>
    </button></div>`;
  }

  private update(): void {
    if (!this.container) return;
    const focused = document.activeElement?.matches('input[name="user-search"]')
      ? (document.activeElement as HTMLInputElement)
      : null;
    const selectionStart = focused?.selectionStart;
    const selectionEnd = focused?.selectionEnd;
    this.container.innerHTML = this.render();
    if (focused) {
      const input = this.container.querySelector<HTMLInputElement>('input[name="user-search"]');
      input?.focus();
      if (
        selectionStart !== null &&
        selectionStart !== undefined &&
        selectionEnd !== null &&
        selectionEnd !== undefined
      ) {
        input?.setSelectionRange(selectionStart, selectionEnd);
      }
    }
  }

  bindEvents(): void {
    this.layout.bindEvents();
    this.container?.addEventListener('input', this.handleInput);
    this.container?.addEventListener('click', this.handleClick);
    this.container?.addEventListener('keydown', this.handleKeydown);
  }

  private readonly handleInput = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    if (input.name !== 'user-search') return;
    this.model.query = input.value;
    if (this.searchTimer !== null) window.clearTimeout(this.searchTimer);
    this.searchTimer = window.setTimeout(() => {
      this.searchTimer = null;
      void this.model.search(input.value);
    }, 250);
  };

  private readonly handleClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.closest('[data-public-profile-close]')) {
      this.publicProfile = null;
      this.update();
      return;
    }
    const backdrop = target.closest<HTMLElement>('[data-public-profile-backdrop]');
    if (backdrop && target === backdrop) {
      this.publicProfile = null;
      this.update();
      return;
    }
    if (target.closest('[data-users-retry]')) {
      void this.model.search(this.model.query);
      return;
    }
    if (target.closest('[data-users-more]')) {
      void this.model.loadMore();
      return;
    }
    const userId = target.closest<HTMLElement>('[data-open-user]')?.dataset.openUser;
    if (userId) {
      const item = this.model.users.value.find((candidate) => candidate.user_id === userId);
      if (item) this.openProfile(item);
      return;
    }
    if (target.closest('[data-public-profile-add-contact]')) {
      void this.addToContacts();
    }
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.publicProfile) {
      this.publicProfile = null;
      this.update();
    }
  };

  private openProfile(item: UserSearchItem): void {
    const displayName =
      [item.first_name, item.last_name].filter(Boolean).join(' ') || item.nickname;
    this.publicProfile = {
      userId: item.user_id,
      firstName: item.first_name,
      lastName: item.last_name,
      nickname: item.nickname,
      avatarUrl: item.icon_url,
      initials: getChatInitials(displayName),
      isContact: item.is_contact,
    };
    this.update();
    this.container?.querySelector<HTMLButtonElement>('[data-public-profile-close]')?.focus();
  }

  private async addToContacts(): Promise<void> {
    const profile = this.publicProfile;
    if (!profile || profile.isContact || profile.isAddingContact) return;
    profile.isAddingContact = true;
    this.update();
    const result = await ContactsApi.createContact({ nickname: profile.nickname });
    if (this.publicProfile?.userId === profile.userId) {
      this.publicProfile.isAddingContact = false;
      if (result.success || (result instanceof ApiError && result.status === 409)) {
        this.publicProfile.isContact = true;
        this.model.users.value = this.model.users.value.map((item) =>
          item.user_id === profile.userId ? { ...item, is_contact: true } : item,
        );
      }
      this.update();
    }
    if (result.success) {
      eventBus.emit('snackbar:show', { text: 'Контакт добавлен', type: 'success' });
    } else if (result instanceof ApiError && result.status === 409) {
      eventBus.emit('snackbar:show', { text: 'Пользователь уже в контактах', type: 'info' });
    } else if (result instanceof ApiError) {
      eventBus.emit('snackbar:show', { text: result.message, type: 'error' });
    }
  }

  async afterMount(): Promise<void> {
    const query = new URLSearchParams(window.location.search).get('q');
    if (query) {
      this.model.query = query;
      await this.model.search(query);
    }
  }

  unmount(): void {
    if (this.searchTimer !== null) window.clearTimeout(this.searchTimer);
    this.container?.removeEventListener('input', this.handleInput);
    this.container?.removeEventListener('click', this.handleClick);
    this.container?.removeEventListener('keydown', this.handleKeydown);
    this.layout.unmount();
    this.model.destroy();
    super.unmount();
  }
}
