import './ChatList.scss';
import './Skeleton.scss';
import { Button } from '@/components/core/Button.js';
import type { DisplayChat } from '@/api/chats/chats.types';
import { Input } from '@/components/core/Input.js';
import { SearchIcon } from '@/components/core/Icons.js';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';
import { renderChatListLoading } from './ChatListLoading.js';

/**
 * Компонент списка чатов
 */
export class ChatList {
  /**
   * Рендерит один элемент чата
   */
  renderChatItem(chat: DisplayChat, activeChatId: string | null): string {
    const isActive = activeChatId === chat.id;
    const itemClass = isActive ? 'chat-item chat-item--active' : 'chat-item';
    const onlineIndicator = chat.isOnline ? '<div class="chat-item__online"></div>' : '';
    const unreadBadge = chat.unreadCount
      ? `
        <span class="chat-item__unread">
          ${chat.unreadCount}
        </span>
      `
      : '';

    return `
    <div class="${itemClass}">
      <div class="chat-item__inner">
        <div class="chat-item__avatar-box">
          <div class="chat-item__avatar">
            <span class="chat-item__avatar-initials">${escapeHtml(chat.initials)}</span>
          </div>
          ${onlineIndicator}
        </div>

        <div class="chat-item__body">
          <div class="chat-item__top">
            <h3 class="chat-item__name">${escapeHtml(chat.name)}</h3>
            <div class="chat-item__meta">
              <span class="chat-item__time">${escapeHtml(chat.time)}</span>
              ${unreadBadge}
            </div>
          </div>
          <p class="chat-item__message">${escapeHtml(chat.lastMessage)}</p>
        </div>
      </div>
    </div>
    `;
  }

  /**
   * Состояние загрузки
   */
  renderLoadingState(): string {
    return renderChatListLoading();
  }

  /**
   * Пустое состояние
   */
  renderEmptyState(): string {
    const searchInput = Input({
      placeholder: 'Поиск по сообщениям',
      icon: SearchIcon,
    });

    return `
      <div class="chat-panel">
        <div class="chat-panel__header">
          <h2 class="chat-panel__title">Чаты</h2>
          <p class="chat-panel__status">В сети</p>
        </div>

        <div class="chat-panel__search">
          ${searchInput}
        </div>

        <div class="chat-panel__empty">
          <div class="chat-panel__empty-inner">
            <svg class="icon icon--4xl chat-panel__empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <p class="chat-panel__empty-title">Список пока пуст</p>
            <p class="chat-panel__empty-hint">Новые диалоги появятся здесь</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Стандартное состояние со списком чатов
   */
  renderDefaultState(chats: DisplayChat[], activeChatId: string | null): string {
    const searchInput = Input({
      placeholder: 'Поиск по сообщениям',
      icon: SearchIcon,
    });

    const allChatsButton = Button({
      text: 'Все',
      className: 'button--chip',
    });
    const notReadButton = Button({
      text: 'Непрочитанные',
      className: 'button--chip',
    });
    const privateChatsButton = Button({
      text: 'Личные',
      className: 'button--chip',
    });

    const chatItems = chats.map((chat) => this.renderChatItem(chat, activeChatId)).join('');

    return `
      <div class="chat-panel">
        <div class="chat-panel__header">
          <h2 class="chat-panel__title">Чаты</h2>
          <p class="chat-panel__status">В сети</p>
        </div>

        <div class="chat-panel__search">
          ${searchInput}
        </div>

        <div class="chat-panel__filters">
          <div class="chat-panel__filter-row">
            ${allChatsButton}
            ${notReadButton}
            ${privateChatsButton}
          </div>
        </div>

        <div class="chat-panel__list">
          ${chatItems}
        </div>

        <div class="chat-panel__footer">
          <div class="chat-panel__footer-row">
            <span>сVяZь Web</span>
            <span>v 2.8.1</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Основной метод рендеринга
   */
  render(chats: DisplayChat[], activeChat: DisplayChat | null, isLoading: boolean): string {
    if (isLoading) {
      return this.renderLoadingState();
    }

    if (chats.length === 0) {
      return this.renderEmptyState();
    }

    return this.renderDefaultState(chats, activeChat?.id ?? null);
  }
}
