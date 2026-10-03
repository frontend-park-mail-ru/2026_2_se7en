import { Button } from './Button.js';
import { Input } from './Input.js';
import { renderChatListLoading } from './ChatListLoading.js';
import { loadTemplate } from '../helpers/LoadTemplate.js';

/**
 * Компонент списка чатов
 */
export class ChatList {
  constructor() {
    this.templates = {};
  }

  async loadTemplates() {
    await loadTemplate(this.templates, 'chat-item');
  }

  /**
   * Рендерит один элемент чата через шаблон
   */
  renderChatItem(chat, activeChatId) {
    const template = this.templates['chat-item'];
    if (!template) return '';

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
    return renderChatListLoading();
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

    const filterButtonClass =
      'px-2.5 py-1 text-xs font-normal rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200';

    const allChatsButton = Button({
      text: 'Все',
      className: filterButtonClass,
    });
    const notReadButton = Button({
      text: 'Непрочитанные',
      className: filterButtonClass,
    });
    const privateChatsButton = Button({
      text: 'Личные',
      className: filterButtonClass,
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
