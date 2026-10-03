import { Button } from './Button.js';
import { Input } from './Input.js';

/**
 * Компонент списка чатов
 */
export class ChatList {
  constructor() {
    this.templates = {};
  }

  async loadTemplate(name) {
    if (this.templates[name]) return this.templates[name];

    const response = await fetch(`/templates/${name}.hbs`);
    const source = await response.text();
    this.templates[name] = Handlebars.compile(source);
    return this.templates[name];
  }

  async loadTemplates() {
    await this.loadTemplate('chat-item');
  }

  /**
   * Рендерит один элемент чата через шаблон
   */
  renderChatItem(chat, activeChatId) {
    const template = this.templates['chat-item'];
    if (!template) {
      console.warn(`Шаблон chat-item не найден! Рендерим заглушку для: ${chat.name}`);
      return `
      <div class="p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
        <div class="flex gap-3">
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span class="text-blue-600 font-semibold">${chat.initials}</span>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">${chat.name}</h3>
            <p class="text-sm text-gray-500">${chat.lastMessage}</p>
          </div>
        </div>
      </div>
    `;
    }

    return template({
      id: chat.id,
      name: chat.name,
      initials: chat.initials,
      isOnline: chat.isOnline,
      time: chat.time,
      lastMessage: chat.lastMessage,
      unreadCount: chat.unreadCount,
      isActive: activeChatId === chat.id,
    });
  }

  /**
   * Состояние загрузки
   */
  renderLoadingState() {
    return `
      <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <div class="h-8 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
          <div class="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        <div class="p-3">
          <div class="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>

        <div class="flex-1 overflow-y-auto p-2 space-y-2">
          ${Array(6)
            .fill(
              `
            <div class="p-3 rounded-xl animate-pulse">
              <div class="flex gap-3">
                <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    `;
  }

  /**
   * Пустое состояние
   */
  renderEmptyState() {
    const searchInput = Input({
      placeholder: 'Поиск по сообщениям',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>',
    });

    return `
      <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Чаты</h2>
          <p class="text-sm text-green-600">В сети</p>
        </div>
        
        <div class="p-3">
          ${searchInput}
        </div>

        <div class="flex-1 flex items-center justify-center p-6">
          <div class="text-center">
            <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <p class="text-sm font-medium text-gray-900">Список пока пуст</p>
            <p class="text-xs text-gray-400 mt-1">Новые диалоги появятся здесь</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Стандартное состояние со списком чатов
   */
  renderDefaultState(chats, activeChatId) {
    const searchInput = Input({
      placeholder: 'Поиск по сообщениям',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>',
    });

    const allChatsButton = Button({
      text: 'Все',
      mode: 'chatsList',
    });
    const notReadButton = Button({
      text: 'Непрочитанные',
      mode: 'chatsList',
    });
    const privateChatsButton = Button({
      text: 'Личные',
      mode: 'chatsList',
    });

    const chatItems = chats.map((chat) => this.renderChatItem(chat, activeChatId)).join('');

    return `
      <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Чаты</h2>
          <p class="text-sm text-green-600">В сети</p>
        </div>
        
        <div class="p-3">
          ${searchInput}
        </div>

        <div class="px-3 pb-3">
          <div class="flex gap-2">
            ${allChatsButton}
            ${notReadButton}
            ${privateChatsButton}
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          ${chatItems}
        </div>

        <div class="p-3 border-t border-gray-200">
          <div class="flex items-center justify-between text-xs text-gray-400">
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
  render(chats, activeChatId, isLoading) {
    if (isLoading) {
      return this.renderLoadingState();
    }

    if (chats.length === 0) {
      return this.renderEmptyState();
    }

    return this.renderDefaultState(chats, activeChatId);
  }
}
