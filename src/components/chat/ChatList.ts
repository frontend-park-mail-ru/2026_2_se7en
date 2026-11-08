import './ChatList.scss';
import './Skeleton.scss';
import type { DisplayChat } from '@/api/chats/chats.types.ts';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';

const asset = (name: string): string => `/design-assets/${name}`;

export type ChatFilter = 'all' | 'unread' | 'dialog' | 'group';

export class ChatList {
  renderChatItem(chat: DisplayChat, activeChatId: string | null): string {
    const isActive = activeChatId === chat.id;
    const unreadBadge = chat.unreadCount
      ? `<span class="chat-item__unread">${chat.unreadCount}</span>`
      : '';

    return `
      <button
        type="button"
        data-chat-id="${escapeHtml(chat.id ?? '')}"
        class="chat-item${isActive ? ' chat-item_active' : ''}"
      >
        <span class="chat-item__avatar-box">
          <span class="chat-item__avatar">${chat.icon_url ? `<img class="chat-item__avatar-image" src="${escapeHtml(chat.icon_url)}" alt="">` : escapeHtml(chat.initials)}</span>
          ${chat.isOnline ? '<span class="chat-item__online"></span>' : ''}
        </span>
        <span class="chat-item__body">
          <span class="chat-item__name">${escapeHtml(chat.name)}</span>
          <span class="chat-item__message">${escapeHtml(chat.lastMessage)}</span>
        </span>
        <span class="chat-item__meta">
          <span class="chat-item__time">${escapeHtml(chat.time)}</span>
          ${unreadBadge}
        </span>
      </button>
    `;
  }

  private renderHeader(isCreateMenuOpen: boolean): string {
    return `
      <div class="chat-panel__header">
        <div>
          <h2 class="chat-panel__title">Чаты</h2>
          <p class="chat-panel__status">В сети</p>
        </div>
        <button
          id="new-chat-button"
          type="button"
          class="chat-panel__new"
          aria-label="Создать чат"
          aria-haspopup="menu"
          aria-expanded="${isCreateMenuOpen}"
        >
          <img src="${asset('f1f87.svg')}" alt="" width="19" height="19">
        </button>
      </div>
    `;
  }

  private renderSearch(query: string, activeFilter: ChatFilter): string {
    return `
      <div class="chat-panel__tools">
        <label class="chat-panel__search">
          <img src="${asset('7c7b6.svg')}" alt="" width="17" height="17">
          <input type="search" name="chat-search" value="${escapeHtml(query)}" placeholder="Поиск по сообщениям" aria-label="Поиск по сообщениям" data-chat-list-search>
        </label>
        <div class="chat-panel__filters" role="group" aria-label="Фильтр чатов">
          <button type="button" class="chat-panel__filter${activeFilter === 'all' ? ' chat-panel__filter_active' : ''}" data-chat-filter="all" aria-pressed="${activeFilter === 'all'}">Все</button>
          <button type="button" class="chat-panel__filter${activeFilter === 'unread' ? ' chat-panel__filter_active' : ''}" data-chat-filter="unread" aria-pressed="${activeFilter === 'unread'}">Непрочитанные</button>
          <button type="button" class="chat-panel__filter${activeFilter === 'dialog' ? ' chat-panel__filter_active' : ''}" data-chat-filter="dialog" aria-pressed="${activeFilter === 'dialog'}">Диалоги</button>
          <button type="button" class="chat-panel__filter${activeFilter === 'group' ? ' chat-panel__filter_active' : ''}" data-chat-filter="group" aria-pressed="${activeFilter === 'group'}">Группы</button>
        </div>
      </div>
    `;
  }

  private renderCreateMenu(isOpen: boolean): string {
    if (!isOpen) return '';

    return `
      <div class="chat-panel__create-menu" role="menu" aria-label="Создать чат">
        <button type="button" role="menuitem" data-create-dialog>Новый диалог</button>
        <button type="button" role="menuitem" data-create-group>Новая группа</button>
        <button type="button" role="menuitem" data-create-channel>Новый канал</button>
      </div>
    `;
  }

  render(
    chats: DisplayChat[],
    activeChat: DisplayChat | null,
    isLoading: boolean,
    isCreateMenuOpen = false,
    options: { query?: string; filter?: ChatFilter } = {},
  ): string {
    const filter = options.filter ?? 'all';
    const query = (options.query ?? '').trim().toLocaleLowerCase('ru-RU');
    const visibleChats = chats.filter((chat) => {
      if (filter === 'unread' && chat.unreadCount === 0) return false;
      if (filter === 'dialog' && chat.type !== 'dialog') return false;
      if (filter === 'group' && chat.type !== 'group') return false;
      if (!query) return true;

      return `${chat.name ?? ''} ${chat.lastMessage}`.toLocaleLowerCase('ru-RU').includes(query);
    });

    const list = isLoading
      ? Array.from(
          { length: 6 },
          () => `
          <div class="chat-panel__loading-item">
            <span class="skeleton skeleton_circle"></span>
            <span class="chat-panel__loading-lines">
              <span class="skeleton"></span>
              <span class="skeleton"></span>
            </span>
          </div>
        `,
        ).join('')
      : visibleChats.length
        ? visibleChats.map((chat) => this.renderChatItem(chat, activeChat?.id ?? null)).join('')
        : `
          <div class="chat-panel__empty">
            <p>${chats.length ? 'Ничего не найдено' : 'Список пока пуст'}</p>
            <span>${chats.length ? 'Попробуйте другой фильтр или запрос' : 'Новые диалоги появятся здесь'}</span>
          </div>
        `;

    return `
      <section class="chat-panel" aria-label="Список чатов">
        ${this.renderHeader(isCreateMenuOpen)}
        ${this.renderSearch(options.query ?? '', options.filter ?? 'all')}
        <div class="chat-panel__list" aria-busy="${isLoading}">${list}</div>
        <div class="chat-panel__footer">
          <span>Связь Web</span>
          <span>v 2.8.1</span>
        </div>
        ${this.renderCreateMenu(isCreateMenuOpen)}
      </section>
    `;
  }
}
