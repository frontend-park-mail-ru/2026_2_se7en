import './ChatArea.scss';
import { ChatSkeleton } from './ChatSkeleton.ts';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';
import type { DisplayChat, Message } from '@/api/chats/chats.types.ts';
import type { ChatAreaOptions } from './chat.types.ts';
import { Button } from '@/components/core/Button.ts';
import { EditGroupIcon, MessageReadIcon, MessageSentIcon } from '@/components/core/Icons.ts';

const asset = (name: string): string => `/design-assets/${name}`;

/** Отображает выбранный диалог, сообщения и форму отправки. */
export class ChatArea {
  private renderMessage(message: Message): string {
    return `
      <div class="chat-area__message-row${message.isOutgoing ? ' chat-area__message-row_outgoing' : ''}" data-message-id="${escapeHtml(String(message.id))}">
        <div class="chat-area__message${message.isOutgoing ? ' chat-area__message_outgoing' : ''}">
          <span class="chat-area__message-text">${escapeHtml(message.text)}</span>
          <span class="chat-area__message-meta">
            ${escapeHtml(message.time)}
            ${message.isOutgoing ? (message.isRead ? MessageReadIcon : MessageSentIcon) : ''}
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
            ${Button({ text: 'Отмена', mode: 'unstyled', attrs: { 'data-cancel-delete': '' } })}
            ${Button({ text: 'Удалить', mode: 'unstyled', className: 'chat-area__modal-danger', attrs: { 'data-confirm-delete': '' } })}
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
            ariaLabel: isGroup ? 'Открыть информацию о группе' : 'Информация о собеседнике',
            attrs: isGroup ? { 'data-open-group-info': '' } : {},
          })}
          <div class="chat-area__actions">
            ${Button({ text: `<img src="${asset('3a6d7.svg')}" alt="" width="19" height="19">`, mode: 'unstyled', className: 'chat-area__icon-button', ariaLabel: 'Поиск в диалоге', attrs: { 'data-chat-search': '' } })}
            ${Button({ text: `<img src="${asset('d4d19.svg')}" alt="" width="19" height="19">`, mode: 'unstyled', className: `chat-area__icon-button${options.menuOpen ? ' chat-area__icon-button_active' : ''}`, ariaLabel: 'Меню диалога', attrs: { 'aria-haspopup': 'menu', 'aria-expanded': String(Boolean(options.menuOpen)), 'data-dialog-menu-toggle': '' } })}
          </div>
          ${
            options.menuOpen
              ? `
            <div class="chat-area__menu" role="menu">
              ${
                isGroup && options.canEditGroup
                  ? `
                ${Button({ text: `${EditGroupIcon} Изменить группу`, mode: 'unstyled', attrs: { role: 'menuitem', 'data-open-group-edit': '' } })}
              `
                  : ''
              }
              ${isGroup && !options.canEditGroup ? Button({ text: 'Информация о группе', mode: 'unstyled', attrs: { role: 'menuitem', 'data-open-group-info': '' } }) : ''}
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
        </header>

        <div class="chat-area__history" aria-busy="${Boolean(options.messagesLoading)}" data-message-history>
          ${
            options.messagesLoading
              ? '<p class="chat-area__history-status" role="status">Загрузка сообщений…</p>'
              : options.messagesError
                ? `<div class="chat-area__history-status" role="alert"><p>${escapeHtml(options.messagesError)}</p>${Button({ text: 'Повторить', mode: 'unstyled', attrs: { 'data-messages-retry': '' } })}</div>`
                : hasMessages
                  ? `
            ${options.hasMoreMessages ? Button({ text: 'Загрузить предыдущие сообщения', mode: 'unstyled', className: 'chat-area__load-more', attrs: { 'data-messages-more': '' } }) : ''}
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
          ${Button({ text: `<img src="${asset('f4e99.svg')}" alt="" width="19" height="19">`, mode: 'unstyled', className: 'chat-area__attach', ariaLabel: 'Прикрепить файл', attrs: { 'data-message-attach': '' } })}
          <div class="chat-area__input-wrap">
            <input name="message" type="text" maxlength="4096" value="${escapeHtml(draft)}" placeholder="Напишите сообщение…" autocomplete="off" aria-label="Сообщение" data-message-input>
            ${Button({ text: `<img src="${asset('5a40e.svg')}" alt="" width="19" height="19">`, mode: 'unstyled', className: 'chat-area__emoji', ariaLabel: 'Добавить эмодзи', attrs: { 'data-message-emoji': '' } })}
          </div>
          ${Button({ text: `<img src="${asset('1dc80.svg')}" alt="" width="20" height="20">`, type: 'submit', mode: 'unstyled', className: 'chat-area__send', ariaLabel: 'Отправить сообщение', disabled: !draft.trim() || Boolean(options.sending) })}
        </form>
        ${options.sendError ? `<p class="chat-area__send-error" role="alert">${escapeHtml(options.sendError)}</p>` : ''}
        ${options.deleteConfirmOpen ? this.renderDeleteConfirm(chat.name ?? '', isGroup) : ''}
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
    if (isLoading) {
      return ChatSkeleton.render();
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
