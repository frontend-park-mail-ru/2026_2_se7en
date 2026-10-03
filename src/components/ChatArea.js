import { Button } from './Button.js';
import { ChatSkeleton } from './ChatSkeleton.js';
import { loadTemplate } from '../helpers/LoadTemplate.js';

/**
 * Компонент области чата
 */
export class ChatArea {
  constructor() {
    this.templates = {};
  }

  async loadTemplates() {
    await loadTemplate(this.templates, 'skeleton-message');
  }

  renderChatAreaLoading() {
    return ChatSkeleton.render();
  }

  renderEmptyChatArea() {
    const newChatButton = Button({
      text: 'Новый чат',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>',
      mode: 'primary',
    });

    return `
      <div class="flex-1 bg-gray-50 flex items-center justify-center">
        <div class="text-center max-w-md px-4">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Начните первый разговор</h2>
          <p class="text-gray-500 mb-6">Выберите контакт или создайте новый чат — сообщения будут доступны на всех ваших устройствах.</p>
          ${newChatButton}
        </div>
      </div>
    `;
  }

  renderSelectChatPrompt() {
    return `
      <div class="flex-1 bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Выберите чат</h2>
          <p class="text-gray-500">Выберите любой чат слева — переписка появится здесь.</p>
        </div>
      </div>
    `;
  }

  /**
   * Основной метод рендеринга
   */
  render(activeChat, chats, isLoading) {
    if (isLoading) {
      return this.renderChatAreaLoading();
    }

    if (!activeChat && chats.length === 0) {
      return this.renderEmptyChatArea();
    }

    return this.renderSelectChatPrompt();
  }
}
