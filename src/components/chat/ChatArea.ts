import './ChatArea.scss';
import { Button } from '@/components/core/Button.ts';
import type { ChatAreaOptions } from './chat.types.ts';
import { PanelSearch } from '@/components/core/PanelSearch.ts';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';
import { renderPageControl } from '@/helpers/PagedScroll.ts';
import type { DisplayChat, Message } from '@/api/chats/chats.types.ts';
import {
  EditGroupIcon,
  MessageReadIcon,
  MessageSentIcon,
  SearchIcon,
} from '@/components/core/Icons.ts';

const asset = (name: string): string => `/design-assets/${name}`;
const READ_SCROLL_IDLE_MS = 200;

/** Отображает выбранный диалог, сообщения и форму отправки. */
export class ChatArea {
  private positionedUnreadId?: string;
  private historyFrame = 0;
  private historyReadTimer?: number;

  bindHistory(
    container: HTMLElement,
    markRead: (id: string) => void,
    loadLatest: () => Promise<void>,
  ): void {
    this.disconnectHistory();
    const history = container.querySelector<HTMLElement>('[data-message-history]');
    const latest = container.querySelector<HTMLButtonElement>('[data-jump-to-latest]');
    const unreadId = history?.dataset.firstUnreadId;
    if (!unreadId) this.positionedUnreadId = undefined;
    if (!history || !latest) return;
    const separator = history.querySelector<HTMLElement>('[data-unread-separator]');
    if (unreadId && separator && this.positionedUnreadId !== unreadId) {
      history.scrollTop +=
        separator.getBoundingClientRect().top - history.getBoundingClientRect().top - 16;
      this.positionedUnreadId = unreadId;
    }

    const markVisible = () => {
      this.historyReadTimer = undefined;
      if (document.hidden || !history.isConnected || !history.clientHeight) return;

      const bounds = history.getBoundingClientRect();
      let visibleId: string | undefined;
      for (const row of history.querySelectorAll<HTMLElement>('[data-unread-message]')) {
        const rect = row.getBoundingClientRect();
        if (rect.top >= bounds.bottom) break;
        if (rect.bottom > bounds.top) visibleId = row.dataset.messageId;
      }
      if (visibleId) markRead(visibleId);
    };

    const onScroll = () => {
      window.clearTimeout(this.historyReadTimer);
      this.historyReadTimer = window.setTimeout(markVisible, READ_SCROLL_IDLE_MS);

      if (this.historyFrame) return;
      this.historyFrame = requestAnimationFrame(() => {
        this.historyFrame = 0;
        if (!history.isConnected || !history.clientHeight) return;
        latest.hidden =
          history.dataset.hasNewer !== 'true' &&
          history.scrollHeight - history.scrollTop - history.clientHeight < 32;
      });
    };

    history.onscroll = onScroll;
    latest.onclick = async () => {
      await loadLatest();
      this.scrollToLatest(container, history.dataset.scrollKey);
    };
    onScroll();
  }

  scrollToLatest(container: HTMLElement, chatId: string | undefined): void {
    const history = container.querySelector<HTMLElement>('[data-message-history]');
    if (history && history.dataset.scrollKey === chatId) {
      history.scrollTop = history.scrollHeight;
    }
  }

  disconnectHistory(): void {
    if (this.historyFrame) cancelAnimationFrame(this.historyFrame);
    this.historyFrame = 0;
    window.clearTimeout(this.historyReadTimer);
    this.historyReadTimer = undefined;
  }

  private renderMessage(message: Message, pattern?: RegExp, current = false): string {
    const messageHtml = pattern
      ? message.text
          .split(pattern)
          .map((part, index) => {
            const escapedPart = escapeHtml(part);
            return index % 2 ? `<mark>${escapedPart}</mark>` : escapedPart;
          })
          .join('')
      : escapeHtml(message.text);

    return `
      <div class="chat-area__message-row${message.isOutgoing ? ' chat-area__message-row_outgoing' : ''}" ${current ? 'aria-current="true"' : ''} tabindex="-1" data-scroll-row="${escapeHtml(String(message.id))}" data-message-id="${escapeHtml(String(message.id))}" ${!message.isOutgoing && !message.isRead ? 'data-unread-message' : ''}>
        <div class="chat-area__message${message.isOutgoing ? ' chat-area__message_outgoing' : ''}${message.authorName ? ' chat-area__message_group' : ''}">
          ${message.authorName ? `<span class="chat-area__message-author">${escapeHtml(message.authorName)}</span>` : ''}
          <span class="chat-area__message-text">${messageHtml}</span>
          <span class="chat-area__message-meta">
            ${escapeHtml(message.time)}
            ${message.isOutgoing ? (message.isRead ? MessageReadIcon : MessageSentIcon) : ''}
          </span>
        </div>
      </div>
    `;
  }

  renderDeleteConfirm(name: string, isGroup: boolean, error = ''): string {
    return `
      <div class="chat-area__modal-backdrop" role="presentation">
        <div class="chat-area__modal" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
          <h2 id="delete-dialog-title">${isGroup ? `Удалить группу "${escapeHtml(name)}"?` : 'Удалить диалог?'}</h2>
          <p>${
            isGroup
              ? 'Группа и вся переписка будут удалены для всех участников. Это действие нельзя отменить.'
              : 'Переписка будет удалена у всех. Это действие нельзя отменить.'
          }</p>
          ${error ? `<p class="chat-area__modal-error" role="alert">${escapeHtml(error)}</p>` : ''}
          <div class="chat-area__modal-actions">
            ${Button({ text: 'Отмена', mode: 'unstyled', attrs: { 'data-cancel-delete': '' } })}
            ${Button({ text: 'Удалить', mode: 'unstyled', className: 'chat-area__modal-danger', attrs: { 'data-confirm-delete': '' } })}
          </div>
        </div>
      </div>
    `;
  }

  private renderSearch(query: string, index: number, count: number): string {
    return `<div class="chat-area__search" role="search">
      ${PanelSearch({ label: 'Поиск по сообщениям', placeholder: 'Поиск по сообщениям', value: query, name: 'message-search', maxLength: 200 })}
      ${
        query.trim() && count
          ? `
        <span role="status">${index + 1}/${count}</span>
        ${Button({ text: '↑', mode: 'unstyled', ariaLabel: 'Предыдущее сообщение', disabled: count < 2, attrs: { 'data-search-step': '-1' } })}
        ${Button({ text: '↓', mode: 'unstyled', ariaLabel: 'Следующее сообщение', disabled: count < 2, attrs: { 'data-search-step': '1' } })}
      `
          : ''
      }
      ${Button({ text: '×', mode: 'unstyled', ariaLabel: 'Закрыть поиск', attrs: { 'data-close-search': '' } })}
    </div>`;
  }

  private renderHeader(chat: DisplayChat, options: ChatAreaOptions): string {
    const isGroup = chat.type === 'group';
    return `
          ${Button({ text: `<img src="${asset('63b18.svg')}" alt="" width="20" height="20">`, mode: 'unstyled', className: 'chat-area__back', ariaLabel: 'Назад к чатам', attrs: { 'data-chat-back': '' } })}
          ${Button({
            text: `
            <span class="chat-area__avatar">
              ${chat.icon_url ? `<img class="chat-area__avatar-image" src="${escapeHtml(chat.icon_url)}" alt="">` : escapeHtml(chat.initials)}
              ${chat.isOnline ? '<span class="chat-area__online"></span>' : ''}
            </span>
            <span class="chat-area__identity-text">
              <strong>${escapeHtml(chat.name)}</strong>
              <small>${isGroup ? `${chat.members_count ?? 0} участников` : chat.isOnline ? 'в сети' : ''}</small>
            </span>
`,
            mode: 'unstyled',
            className: 'chat-area__identity',
            ariaLabel: isGroup ? 'Открыть информацию о группе' : 'Открыть профиль собеседника',
            attrs: isGroup
              ? { 'data-open-group-info': '' }
              : options.peerUserId
                ? { 'data-open-user-profile': options.peerUserId }
                : {},
          })}
          <div class="chat-area__actions">
            ${Button({
              text: SearchIcon,
              mode: 'unstyled',
              className: 'chat-area__icon-button',
              ariaLabel: 'Поиск по чату',
              title: 'Поиск по чату',
              attrs: { 'data-chat-search': '' },
            })}
            ${Button({ text: `<img src="${asset('d4d19.svg')}" alt="" width="19" height="19">`, mode: 'unstyled', className: `chat-area__icon-button${options.menuOpen ? ' chat-area__icon-button_active' : ''}`, ariaLabel: 'Меню диалога', attrs: { 'aria-haspopup': 'menu', 'aria-expanded': String(Boolean(options.menuOpen)), 'data-dialog-menu-toggle': '' } })}
          </div>
          ${
            options.menuOpen
              ? `
            <div class="chat-area__menu" role="menu">
              ${
                isGroup
                  ? Button({
                      text: 'Информация о группе',
                      mode: 'unstyled',
                      attrs: { role: 'menuitem', 'data-open-group-info': '' },
                    })
                  : ''
              }
              ${
                isGroup && options.canEditGroup
                  ? `
                ${Button({ text: `${EditGroupIcon} Изменить группу`, mode: 'unstyled', attrs: { role: 'menuitem', 'data-open-group-edit': '' } })}
              `
                  : ''
              }
              ${
                !isGroup || options.canDeleteGroup
                  ? Button({
                      text: `<img src="${asset('59372.svg')}" alt="" width="18" height="19"> ${isGroup ? 'Удалить группу' : 'Удалить диалог'}`,
                      mode: 'unstyled',
                      className: 'chat-area__menu-danger',
                      attrs: { role: 'menuitem', 'data-dialog-delete': '' },
                    })
                  : ''
              }
              ${isGroup && !options.canDeleteGroup ? Button({ text: 'Выйти из группы', mode: 'unstyled', className: 'chat-area__menu-danger', attrs: { role: 'menuitem', 'data-group-leave': '' } }) : ''}
            </div>
          `
              : ''
          }
    `;
  }

  private renderConversation(chat: DisplayChat, options: ChatAreaOptions): string {
    const isGroup = chat.type === 'group';
    const query = options.searchQuery?.trim();
    const pattern = query
      ? new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'iu')
      : undefined;
    const messages = options.messages ?? [];
    const pagination = options.messagePagination;
    const currentIndex = Math.max(
      0,
      messages.findIndex((message) => message.id === options.searchMessageId),
    );
    const hasMessages = messages.length > 0;
    const draft = options.draft ?? '';

    return `
      <section class="chat-area chat-area_open" aria-label="Переписка">
        <header class="chat-area__header">
          ${options.searchQuery !== undefined ? this.renderSearch(options.searchQuery, currentIndex, messages.length) : this.renderHeader(chat, options)}
        </header>

        <div class="chat-area__history-wrap">
          <div class="chat-area__history" aria-busy="${Boolean(options.messagesLoading || pagination?.pending)}" data-message-history data-scroll-key="${escapeHtml(chat.id ?? '')}" data-first-unread-id="${escapeHtml(options.firstUnreadId ?? '')}" data-has-newer="${Boolean(pagination?.previous)}">
          ${
            options.messagesLoading
              ? ''
              : options.messagesError
                ? `<div class="chat-area__history-status" role="alert"><p>${escapeHtml(options.messagesError)}</p>${Button({ text: 'Повторить', mode: 'unstyled', attrs: { [query ? 'data-message-search-retry' : 'data-messages-retry']: '' } })}</div>`
                : hasMessages
                  ? `
            ${pagination ? renderPageControl('next', pagination, 'Предыдущие сообщения', 'chat-area__load-more') : ''}
            ${options.moreSearchResults ? Button({ text: 'Загрузить ещё совпадения', mode: 'unstyled', className: 'chat-area__load-more', attrs: { 'data-message-search-more': '' } }) : ''}
            ${options.dateLabel ? `<span class="chat-area__date">${escapeHtml(options.dateLabel)}</span>` : ''}
            <div class="chat-area__messages">
              ${messages
                .map(
                  (message, index) => `
                ${!query && message.id === options.firstUnreadId ? '<div class="chat-area__unread" data-unread-separator>Непрочитанные сообщения</div>' : ''}
                ${this.renderMessage(message, pattern, Boolean(query) && index === currentIndex)}
              `,
                )
                .join('')}
            </div>
            ${pagination ? renderPageControl('previous', pagination, 'Следующие сообщения', 'chat-area__load-more') : ''}
          `
                  : `
            <p class="chat-area__empty-conversation">
              ${query ? `По запросу «${escapeHtml(query)}» ничего не найдено` : 'Напишите первое сообщение в диалоге'}
            </p>
          `
          }
            ${options.typingLabel ? `<p class="chat-area__typing" role="status">${escapeHtml(options.typingLabel)}</p>` : ''}
          </div>
          ${
            !query && hasMessages && !options.messagesLoading && !options.messagesError
              ? Button({
                  text: '↓',
                  mode: 'unstyled',
                  className: 'chat-area__jump-latest',
                  ariaLabel: 'К последним сообщениям',
                  attrs: { 'data-jump-to-latest': '', hidden: '' },
                })
              : ''
          }
        </div>

        <form class="chat-area__composer" data-message-form>
          ${Button({ text: `<img src="${asset('f4e99.svg')}" alt="" width="19" height="19">`, mode: 'unstyled', className: 'chat-area__attach', ariaLabel: 'Прикрепить файл', title: 'Вложения скоро появятся', disabled: true, attrs: { 'data-message-attach': '' } })}
          <div class="chat-area__input-wrap">
            <input name="message" type="text" maxlength="4096" value="${escapeHtml(draft)}" placeholder="Напишите сообщение…" autocomplete="off" aria-label="Сообщение" data-message-input>
            ${Button({ text: `<img src="${asset('5a40e.svg')}" alt="" width="19" height="19">`, mode: 'unstyled', className: 'chat-area__emoji', ariaLabel: 'Добавить эмодзи', title: 'Выбор эмодзи скоро появится', disabled: true, attrs: { 'data-message-emoji': '' } })}
          </div>
          ${Button({ text: `<img src="${asset('1dc80.svg')}" alt="" width="20" height="20">`, type: 'submit', mode: 'unstyled', className: 'chat-area__send', ariaLabel: 'Отправить сообщение', disabled: !draft.trim() || Boolean(options.sending) })}
        </form>
        ${options.sendError ? `<p class="chat-area__send-error" role="alert">${escapeHtml(options.sendError)}</p>` : ''}
        ${options.deleteConfirmOpen ? this.renderDeleteConfirm(chat.name ?? '', isGroup, options.deleteError) : ''}
      </section>
    `;
  }

  /** Возвращает переписку либо состояние загрузки, ошибки или пустого списка. */
  render(
    activeChat: DisplayChat | null,
    chats: DisplayChat[],
    isLoading: boolean,
    hasNetworkError: boolean,
    options: ChatAreaOptions = {},
  ): string {
    if (isLoading && !activeChat && chats.length === 0) {
      return '<section class="chat-area chat-area_placeholder chat-area_loading" aria-busy="true"></section>';
    }

    if (hasNetworkError) {
      return `
        <section class="chat-area chat-area_placeholder">
          <div>
            <h2>Нет подключения к интернету</h2>
            <p>Проверьте подключение и попробуйте ещё раз.</p>
            ${Button({ text: 'Попробовать ещё раз', id: 'retry-connection-btn', mode: 'unstyled' })}
          </div>
        </section>
      `;
    }

    if (activeChat) {
      return this.renderConversation(activeChat, options);
    }

    return `
      <section class="chat-area chat-area_placeholder">
        <div>
          <h2>${chats.length ? 'Выберите чат' : 'Начните первый разговор'}</h2>
          <p>${chats.length ? 'Выберите любой чат слева — переписка появится здесь.' : 'Создайте новый чат, чтобы начать общение.'}</p>
        </div>
      </section>
    `;
  }
}
