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
    const onlineIndicator = chat.isOnline
      ? '<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>'
      : '';
    const unreadBadge = chat.unreadCount
      ? `
        <span class="inline-flex items-center justify-center w-5 h-5 bg-black text-white text-xs font-medium rounded-full">
          ${chat.unreadCount}
        </span>
      `
      : '';

    return `
    <div class="p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors ${isActive ? 'bg-blue-50' : ''}">
      <div class="flex gap-3">
        <div class="relative flex-shrink-0">
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span class="text-blue-600 font-semibold">${escapeHtml(chat.initials)}</span>
          </div>
          ${onlineIndicator}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start mb-1">
            <h3 class="font-semibold text-gray-900 truncate">${escapeHtml(chat.name)}</h3>
            <div class="flex items-center gap-2 flex-shrink-0 ml-2">
              <span class="text-xs text-gray-400">${escapeHtml(chat.time)}</span>
              ${unreadBadge}
            </div>
          </div>
          <p class="text-sm text-gray-500 truncate">${escapeHtml(chat.lastMessage)}</p>
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
  renderDefaultState(chats: DisplayChat[], activeChatId: string | null): string {
    const searchInput = Input({
      placeholder: 'Поиск по сообщениям',
      icon: SearchIcon,
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

        <div class="flex flex-col gap-1 flex-1 overflow-y-auto p-2">
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
