import './ChatArea.scss';
import { ChatSkeleton } from './ChatSkeleton.ts';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';
import type { DisplayChat, Message } from '@/api/chats/chats.types.ts';

export interface ChatAreaOptions {
  messages?: Message[];
  messagesLoading?: boolean;
  messagesError?: string;
  sendError?: string;
  sending?: boolean;
  draft?: string;
  dateLabel?: string;
  hasMoreMessages?: boolean;
  typingLabel?: string;
  canEditGroup?: boolean;
  canDeleteGroup?: boolean;
  menuOpen?: boolean;
  deleteConfirmOpen?: boolean;
}

const asset = (name: string): string => `/design-assets/${name}`;

export class ChatArea {
  private renderMessage(message: Message): string {
    return `
      <div class="chat-area__message-row${message.isOutgoing ? ' chat-area__message-row_outgoing' : ''}" data-message-id="${escapeHtml(String(message.id))}">
        <div class="chat-area__message${message.isOutgoing ? ' chat-area__message_outgoing' : ''}">
          <span class="chat-area__message-text">${escapeHtml(message.text)}</span>
          <span class="chat-area__message-meta">
            ${escapeHtml(message.time)}
            ${
              message.isOutgoing
                ? message.isRead
                  ? '<img src="/design-assets/b3d0c.svg" alt="Прочитано" width="12" height="12">'
                  : '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" role="img" aria-label="Отправлено"><path d="M10.5 3 4.5 9 1.5 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                : ''
            }
          </span>
        </div>
      </div>
    `;
  }

  private renderDeleteConfirm(name: string, isGroup: boolean): string {
    return `
      <div class="chat-area__modal-backdrop" role="presentation">
        <div class="chat-area__modal" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
          <h2 id="delete-dialog-title">${isGroup ? `Удалить группу "${escapeHtml(name)}"?` : 'Удалить диалог?'}</h2>
          <p>${
            isGroup
              ? 'Группа и вся переписка будут удалены для всех участников. Это действие нельзя отменить.'
              : 'Переписка будет удалена у всех. Это действие нельзя отменить.'
          }</p>
          <div class="chat-area__modal-actions">
            <button type="button" data-cancel-delete>Отмена</button>
            <button type="button" class="chat-area__modal-danger" data-confirm-delete>Удалить</button>
          </div>
        </div>
      </div>
    `;
  }

  private renderConversation(chat: DisplayChat, options: ChatAreaOptions): string {
    const isGroup = chat.type === 'group';
    const messages = options.messages ?? [];
    const hasMessages = messages.length > 0;
    const draft = options.draft ?? '';

    return `
      <section class="chat-area chat-area_open" aria-label="Переписка">
        <header class="chat-area__header">
          <button type="button" class="chat-area__back" data-chat-back aria-label="Назад к чатам">
            <img src="${asset('63b18.svg')}" alt="" width="20" height="20">
          </button>
          <button
            type="button"
            class="chat-area__identity"
            ${isGroup ? 'data-open-group-info' : ''}
            aria-label="${isGroup ? 'Открыть информацию о группе' : 'Информация о собеседнике'}"
          >
            <span class="chat-area__avatar">
              ${chat.icon_url ? `<img class="chat-area__avatar-image" src="${escapeHtml(chat.icon_url)}" alt="">` : escapeHtml(chat.initials)}
              ${chat.isOnline ? '<span class="chat-area__online"></span>' : ''}
            </span>
            <span class="chat-area__identity-text">
              <strong>${escapeHtml(chat.name)}</strong>
              <small>${isGroup ? `${chat.members_count ?? 0} участников` : chat.isOnline ? 'в сети' : ''}</small>
            </span>
          </button>
          <div class="chat-area__actions">
            <button type="button" aria-label="Поиск в диалоге" class="chat-area__icon-button" data-chat-search>
              <img src="${asset('3a6d7.svg')}" alt="" width="19" height="19">
            </button>
            <button
              type="button"
              aria-label="Меню диалога"
              aria-haspopup="menu"
              aria-expanded="${Boolean(options.menuOpen)}"
              data-dialog-menu-toggle
              class="chat-area__icon-button${options.menuOpen ? ' chat-area__icon-button_active' : ''}"
            >
              <img src="${asset('d4d19.svg')}" alt="" width="19" height="19">
            </button>
          </div>
          ${
            options.menuOpen
              ? `
            <div class="chat-area__menu" role="menu">
              ${
                isGroup && options.canEditGroup
                  ? `
                <button type="button" role="menuitem" data-open-group-edit>
                  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true"><path d="M4 14.5 13.8 4.7a2.1 2.1 0 0 1 3 3L7 17.5H4v-3Z" stroke="currentColor" stroke-width="1.5"/><path d="m12 6.5 3 3" stroke="currentColor" stroke-width="1.5"/></svg>
                  Изменить группу
                </button>
              `
                  : ''
              }
              ${isGroup && !options.canEditGroup ? '<button type="button" role="menuitem" data-open-group-info>Информация о группе</button>' : ''}
              ${
                !isGroup || options.canDeleteGroup
                  ? `<button type="button" role="menuitem" class="chat-area__menu-danger" data-dialog-delete>
                <img src="${asset('59372.svg')}" alt="" width="18" height="19">
                ${isGroup ? 'Удалить группу' : 'Удалить диалог'}
              </button>`
                  : ''
              }
              ${isGroup && !options.canDeleteGroup ? '<button type="button" role="menuitem" class="chat-area__menu-danger" data-group-leave>Выйти из группы</button>' : ''}
            </div>
          `
              : ''
          }
        </header>

        <div class="chat-area__history" aria-busy="${Boolean(options.messagesLoading)}" data-message-history>
          ${
            options.messagesLoading
              ? '<p class="chat-area__history-status" role="status">Загрузка сообщений…</p>'
              : options.messagesError
                ? `<div class="chat-area__history-status" role="alert"><p>${escapeHtml(options.messagesError)}</p><button type="button" data-messages-retry>Повторить</button></div>`
                : hasMessages
                  ? `
            ${options.hasMoreMessages ? '<button type="button" class="chat-area__load-more" data-messages-more>Загрузить предыдущие сообщения</button>' : ''}
            ${options.dateLabel ? `<span class="chat-area__date">${escapeHtml(options.dateLabel)}</span>` : ''}
            <div class="chat-area__messages">
              ${messages.map((message) => this.renderMessage(message)).join('')}
            </div>
          `
                  : `
            <p class="chat-area__empty-conversation">
              Напишите первое сообщение в диалоге
            </p>
          `
          }
          ${options.typingLabel ? `<p class="chat-area__typing" role="status">${escapeHtml(options.typingLabel)}</p>` : ''}
        </div>

        <form class="chat-area__composer" data-message-form>
          <button type="button" class="chat-area__attach" aria-label="Прикрепить файл" data-message-attach>
            <img src="${asset('f4e99.svg')}" alt="" width="19" height="19">
          </button>
          <div class="chat-area__input-wrap">
            <input name="message" type="text" maxlength="4096" value="${escapeHtml(draft)}" placeholder="Напишите сообщение…" autocomplete="off" aria-label="Сообщение" data-message-input>
            <button type="button" aria-label="Добавить эмодзи" class="chat-area__emoji" data-message-emoji>
              <img src="${asset('5a40e.svg')}" alt="" width="19" height="19">
            </button>
          </div>
          <button type="submit" class="chat-area__send" aria-label="Отправить сообщение" ${draft.trim() && !options.sending ? '' : 'disabled'}>
            <img src="${asset('1dc80.svg')}" alt="" width="20" height="20">
          </button>
        </form>
        ${options.sendError ? `<p class="chat-area__send-error" role="alert">${escapeHtml(options.sendError)}</p>` : ''}
        ${options.deleteConfirmOpen ? this.renderDeleteConfirm(chat.name ?? '', isGroup) : ''}
      </section>
    `;
  }

  render(
    activeChat: DisplayChat | null,
    chats: DisplayChat[],
    isLoading: boolean,
    hasNetworkError: boolean,
    options: ChatAreaOptions = {},
  ): string {
    if (isLoading) {
      return ChatSkeleton.render();
    }

    if (hasNetworkError) {
      return `
        <section class="chat-area chat-area_placeholder">
          <div>
            <h2>Нет подключения к интернету</h2>
            <p>Проверьте подключение и попробуйте ещё раз.</p>
            <button type="button" id="retry-connection-btn">Попробовать ещё раз</button>
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
