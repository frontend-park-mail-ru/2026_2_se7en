import './ChatArea.scss';
import { Button } from '@/components/core/Button.js';
import { ChatSkeleton } from './ChatSkeleton.js';
import type { DisplayChat } from '@/api/chats/chats.types';

/**
 * Компонент области чата
 */
export class ChatArea {
  renderChatAreaLoading(): string {
    return ChatSkeleton.render();
  }

  renderEmptyChatArea(): string {
    const newChatButton = Button({
      text: 'Новый чат',
      iconBefore:
        '<svg class="icon icon--md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>',
      mode: 'primary',
    });

    return `
      <div class="chat-area">
        <div class="chat-area__placeholder">
          <div class="chat-area__icon-wrap">
            <svg class="icon icon--2xl chat-area__icon chat-area__icon--accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <h2 class="chat-area__title">Начните первый разговор</h2>
          <p class="chat-area__text chat-area__text--spaced">Выберите контакт или создайте новый чат — сообщения будут доступны на всех ваших устройствах.</p>
          ${newChatButton}
        </div>
      </div>
    `;
  }

  renderSelectChatPrompt(): string {
    return `
      <div class="chat-area">
        <div class="chat-area__placeholder chat-area__placeholder--plain">
          <div class="chat-area__icon-wrap chat-area__icon-wrap--lg">
            <svg class="icon icon--3xl chat-area__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9"></path>
            </svg>
          </div>
          <h2 class="chat-area__title">Выберите чат</h2>
          <p class="chat-area__text">Выберите любой чат слева — переписка появится здесь.</p>
        </div>
      </div>
    `;
  }

  renderNoInternetState(): string {
    const retryButton = Button({
      text: 'Попробовать ещё раз',
      id: 'retry-connection-btn',
      mode: 'primary',
    });

    return `
      <div class="chat-area">
        <div class="chat-area__placeholder">
          <div class="chat-area__icon-wrap chat-area__icon-wrap--lg">
            <svg class="icon icon--3xl chat-area__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9"></path>
            </svg>
          </div>
          <h2 class="chat-area__title">Нет подключения к интернету</h2>
          <p class="chat-area__text chat-area__text--spaced">Проверьте Wi-Fi или мобильную сеть и попробуйте ещё раз.</p>
          ${retryButton}
        </div>
      </div>
    `;
  }

  /**
   * Основной метод рендеринга
   */
  render(
    activeChat: DisplayChat | null,
    chats: DisplayChat[],
    isLoading: boolean,
    hasNetworkError: boolean,
  ): string {
    if (isLoading) {
      return this.renderChatAreaLoading();
    }

    if (hasNetworkError) {
      return this.renderNoInternetState();
    }

    if (!activeChat && chats.length === 0) {
      return this.renderEmptyChatArea();
    }

    return this.renderSelectChatPrompt();
  }
}
