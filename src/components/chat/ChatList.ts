import './ChatList.scss';
import { Button } from '@/components/core/Button.ts';
import type { ChatFilter } from './chat.types.ts';
import type { DisplayChat } from '@/api/chats/chats.types.ts';
import type { PaginationState } from '@/helpers/PagedWindow.ts';
import { PanelSearch } from '@/components/core/PanelSearch.ts';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';
import { renderPageControl } from '@/helpers/PagedScroll.ts';
import { type SidebarSearchResults, renderSidebarSearch } from './SidebarSearch.ts';
export type { ChatFilter } from './chat.types.ts';

const asset = (name: string): string => `/design-assets/${name}`;

/** Отображает и фильтрует список диалогов и групп. */
export class ChatList {
  /** Возвращает строку списка с данными одного чата. */
  renderChatItem(chat: DisplayChat, activeChatId: string | null): string {
    const isActive = activeChatId === chat.id;
    const unreadBadge = chat.unreadCount
      ? `<span class="chat-item__unread">${chat.unreadCount}</span>`
      : '';

    return `
      ${Button({
        text: `
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
`,
        mode: 'unstyled',
        className: `chat-item${isActive ? ' chat-item_active' : ''}`,
        attrs: { 'data-chat-id': chat.id ?? '', 'data-scroll-row': chat.id ?? '' },
      })}
    `;
  }

  private renderHeader(isCreateMenuOpen: boolean): string {
    return `
      <div class="chat-panel__header">
        <div>
          <h2 class="chat-panel__title">Чаты</h2>
          <p class="chat-panel__status">В сети</p>
        </div>
        ${Button({ text: `<img src="${asset('f1f87.svg')}" alt="" width="19" height="19">`, id: 'new-chat-button', mode: 'unstyled', className: 'chat-panel__new', ariaLabel: 'Создать чат', attrs: { 'aria-haspopup': 'menu', 'aria-expanded': String(isCreateMenuOpen) } })}
      </div>
    `;
  }

  private renderFilters(activeFilter: ChatFilter): string {
    return `
        <div class="chat-panel__filters" role="group" aria-label="Фильтр чатов">
          ${Button({ text: 'Все', mode: 'unstyled', className: `chat-panel__filter${activeFilter === 'all' ? ' chat-panel__filter_active' : ''}`, attrs: { 'data-chat-filter': 'all', 'aria-pressed': String(activeFilter === 'all') } })}
          ${Button({ text: 'Непрочитанные', mode: 'unstyled', className: `chat-panel__filter${activeFilter === 'unread' ? ' chat-panel__filter_active' : ''}`, attrs: { 'data-chat-filter': 'unread', 'aria-pressed': String(activeFilter === 'unread') } })}
          ${Button({ text: 'Диалоги', mode: 'unstyled', className: `chat-panel__filter${activeFilter === 'dialog' ? ' chat-panel__filter_active' : ''}`, attrs: { 'data-chat-filter': 'dialog', 'aria-pressed': String(activeFilter === 'dialog') } })}
          ${Button({ text: 'Группы', mode: 'unstyled', className: `chat-panel__filter${activeFilter === 'group' ? ' chat-panel__filter_active' : ''}`, attrs: { 'data-chat-filter': 'group', 'aria-pressed': String(activeFilter === 'group') } })}
        </div>
    `;
  }

  private renderCreateMenu(isOpen: boolean): string {
    if (!isOpen) return '';

    return `
      <div class="chat-panel__create-menu" role="menu" aria-label="Создать чат">
        ${Button({ text: 'Новый диалог', mode: 'unstyled', attrs: { role: 'menuitem', 'data-create-dialog': '' } })}
        ${Button({ text: 'Новая группа', mode: 'unstyled', attrs: { role: 'menuitem', 'data-create-group': '' } })}
        ${Button({ text: 'Новый канал', mode: 'unstyled', attrs: { role: 'menuitem', 'data-create-channel': '' } })}
      </div>
    `;
  }

  private renderChatItems(
    chats: DisplayChat[],
    activeChat: DisplayChat | null,
    isLoading: boolean,
    filter: ChatFilter,
  ): string {
    if (isLoading && chats.length === 0) {
      return '';
    }

    const visibleChats = chats.filter((chat) => {
      switch (filter) {
        case 'unread':
          return chat.unreadCount !== 0;
        case 'dialog':
          return chat.type === 'dialog';
        case 'group':
          return chat.type === 'group';
        case 'all':
          return true;
      }
    });

    if (visibleChats.length) {
      return visibleChats.map((chat) => this.renderChatItem(chat, activeChat?.id ?? null)).join('');
    }

    return `
      <div class="chat-panel__empty">
        <p>${chats.length ? 'Ничего не найдено' : 'Список пока пуст'}</p>
        <span>${chats.length ? 'Попробуйте другой фильтр' : 'Новые диалоги появятся здесь'}</span>
      </div>
    `;
  }

  /** Возвращает список чатов или результаты поиска. */
  render(
    chats: DisplayChat[],
    activeChat: DisplayChat | null,
    isLoading: boolean,
    isCreateMenuOpen = false,
    options: {
      filter?: ChatFilter;
      pagination?: PaginationState;
      query?: string;
      results?: SidebarSearchResults;
    } = {},
  ): string {
    const filter = options.filter ?? 'all';
    const query = options.query ?? '';
    const listContent = options.results
      ? renderSidebarSearch(options.results)
      : this.renderChatItems(chats, activeChat, isLoading, filter);
    const pagination = query.trim() ? undefined : options.pagination;

    return `
      <section class="chat-panel" aria-label="Список чатов">
        ${this.renderHeader(isCreateMenuOpen)}
        <div class="chat-panel__tools">
          ${PanelSearch({ label: 'Поиск по пользователям, контактам, чатам и сообщениям', placeholder: 'Поиск', name: 'sidebar-search', value: query, maxLength: 200 })}
          ${query.trim() ? '' : this.renderFilters(filter)}
        </div>
        <div class="chat-panel__list" data-chat-list data-scroll-key="${escapeHtml(query.trim() ? 'search:' + query.trim() : filter)}" aria-busy="${isLoading || Boolean(pagination?.pending)}">
          ${pagination ? renderPageControl('previous', pagination, 'Предыдущие чаты') : ''}
          ${listContent}
          ${pagination ? renderPageControl('next', pagination, 'Следующие чаты') : ''}
        </div>
        ${this.renderCreateMenu(isCreateMenuOpen)}
      </section>
    `;
  }
}
