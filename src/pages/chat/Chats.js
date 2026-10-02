import { ServerApi } from '../../api/ServerApi.js';

/**
 * Класс, представляющий страницу чатов (PageChats).
 * Отвечает за отображение списка чатов и активного диалога.
 */
export class PageChats {
  constructor() {
    this.chats = [];
    this.activeChat = null;
    this.isLoading = false;
    this.currentUser = {
      initials: 'ВМ',
      name: 'Вы',
    };
  }

  /**
   * Генерирует HTML для боковой панели навигации
   */
  renderSidebar() {
    return `
      <aside class="w-16 bg-white border-r border-gray-200 flex flex-col">
        <!-- Логотип -->
        <div class="p-3">
          <div class="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
            <span class="text-white text-2xl font-bold">С</span>
          </div>
        </div>

        <!-- Навигация -->
        <nav class="flex-1 flex flex-col gap-2 px-2">
          <button class="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 text-blue-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span class="text-xs mt-1">Чаты</span>
          </button>
          
          <button class="flex flex-col items-center justify-center p-3 rounded-xl text-gray-400 hover:bg-gray-50">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span class="text-xs mt-1">Контакты</span>
          </button>
        </nav>

        <!-- Низ боковой панели -->
        <div class="p-3 space-y-2">
          <button class="w-full flex items-center justify-center p-2 rounded-xl text-gray-400 hover:bg-gray-50">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>
          
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <span class="text-blue-600 font-semibold text-sm">${this.currentUser.initials}</span>
          </div>
          <div class="w-2 h-2 bg-green-500 rounded-full mx-auto"></div>
        </div>
      </aside>
    `;
  }

  /**
   * Генерирует HTML для списка чатов
   */
  renderChatList() {
    if (this.isLoading) {
      return this.renderLoadingState();
    }

    if (this.chats.length === 0) {
      return this.renderEmptyState();
    }

    return this.renderDefaultState();
  }

  /**
   * Состояние загрузки (скелетон)
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
    return `
      <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Чаты</h2>
          <p class="text-sm text-green-600">Связь в сети</p>
        </div>
        
        <div class="p-3">
          <div class="relative">
            <input type="text" placeholder="Поиск по сообщениям" 
              class="w-full pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
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
  renderDefaultState() {
    const chatItems = this.chats
      .map(
        (chat) => `
      <div class="p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors ${this.activeChat?.id === chat.id ? 'bg-blue-50' : ''}">
        <div class="flex gap-3">
          <div class="relative">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-600 font-semibold">${chat.initials}</span>
            </div>
            ${chat.isOnline ? '<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>' : ''}
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start mb-1">
              <h3 class="font-semibold text-gray-900 truncate">${chat.name}</h3>
              <span class="text-xs text-gray-400 flex-shrink-0">${chat.time}</span>
            </div>
            <p class="text-sm text-gray-500 truncate">${chat.lastMessage}</p>
          </div>
          
          ${
            chat.unreadCount > 0
              ? `
            <div class="flex-shrink-0">
              <span class="inline-flex items-center justify-center w-5 h-5 bg-black text-white text-xs font-medium rounded-full">
                ${chat.unreadCount}
              </span>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `,
      )
      .join('');

    return `
      <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Чаты</h2>
          <p class="text-sm text-green-600">Связь в сети</p>
        </div>
        
        <div class="p-3">
          <div class="relative">
            <input type="text" placeholder="Поиск по сообщениям" 
              class="w-full pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <div class="px-3 pb-3">
          <div class="flex gap-2">
            <button class="px-3 py-1.5 bg-black text-white text-sm font-medium rounded-lg">Все</button>
            <button class="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200">Непрочитанные</button>
            <button class="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200">Личные</button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          ${chatItems}
        </div>

        <div class="p-3 border-t border-gray-200">
          <div class="flex items-center justify-between text-xs text-gray-400">
            <span>Связь Web</span>
            <span>v 2.8.1</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Генерирует HTML для активной области чата
   */
  renderChatArea() {
    if (this.isLoading) {
      return this.renderChatAreaLoading();
    }

    if (!this.activeChat && this.chats.length === 0) {
      return this.renderEmptyChatArea();
    }

    if (!this.activeChat) {
      return this.renderSelectChatPrompt();
    }

    return this.renderActiveConversation();
  }

  renderChatAreaLoading() {
    return `
      <div class="flex-1 bg-gray-50 flex flex-col">
        <div class="h-16 bg-white border-b border-gray-200 p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded w-32 animate-pulse mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div class="flex-1 p-4 space-y-4">
          ${Array(4)
            .fill(
              `
            <div class="flex gap-3">
              <div class="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div class="flex-1">
                <div class="h-16 bg-gray-200 rounded-2xl animate-pulse"></div>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
        <div class="p-4 bg-white border-t border-gray-200">
          <div class="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
        </div>
      </div>
    `;
  }

  renderEmptyChatArea() {
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
          <button class="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors">
            Новый чат
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  renderSelectChatPrompt() {
    return `
      <div class="flex-1 bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <p class="text-gray-400">Выберите чат для начала общения</p>
        </div>
      </div>
    `;
  }

  renderActiveConversation() {
    return `
      <div class="flex-1 bg-gray-50 flex flex-col">
        <!-- Шапка чата -->
        <div class="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 font-semibold">${this.activeChat.initials}</span>
              </div>
              <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">${this.activeChat.name}</h3>
              <p class="text-xs text-green-600">в сети</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <button class="p-2 hover:bg-gray-100 rounded-lg">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
            <button class="p-2 hover:bg-gray-100 rounded-lg">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Сообщения -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <div class="text-center">
            <span class="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Сегодня</span>
          </div>
          
          ${this.activeChat.messages
            .map(
              (msg) => `
            <div class="flex gap-3 ${msg.isOutgoing ? 'flex-row-reverse' : ''}">
              ${
                !msg.isOutgoing
                  ? `
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-blue-600 font-semibold text-xs">${this.activeChat.initials}</span>
                </div>
              `
                  : ''
              }
              
              <div class="max-w-md ${msg.isOutgoing ? 'bg-black text-white' : 'bg-white text-gray-900'} rounded-2xl px-4 py-3 shadow-sm">
                <p class="text-sm">${msg.text}</p>
                <div class="flex items-center gap-1 mt-1 ${msg.isOutgoing ? 'text-gray-400' : 'text-gray-400'} justify-end">
                  <span class="text-xs">${msg.time}</span>
                  ${
                    msg.isOutgoing
                      ? `
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  `
                      : ''
                  }
                </div>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>

        <!-- Поле ввода -->
        <div class="p-4 bg-white border-t border-gray-200">
          <div class="flex items-end gap-3">
            <button class="p-2 text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
              </svg>
            </button>
            
            <div class="flex-1 bg-gray-50 rounded-2xl px-4 py-3">
              <input type="text" placeholder="Напишите сообщение..." 
                class="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-sm">
            </div>
            
            <button class="p-2 text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </button>
            
            <button class="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Основной рендер страницы
   */
  render() {
    return `
      <div class="min-h-screen bg-gray-50 flex">
        ${this.renderSidebar()}
        ${this.renderChatList()}
        ${this.renderChatArea()}
      </div>
    `;
  }

  /**
   * Инициализация страницы после рендеринга
   */
  mount() {
    this.loadChats();
  }

  /**
   * Загрузка списка чатов с сервера
   */
  async loadChats() {
    this.isLoading = true;
    const data = await ServerApi.getChats();
    this.chats = data.items;
    this.isLoading = false;
  }

  /**
   * Установка активного чата
   */
  setActiveChat(chatId) {
    this.activeChat = this.chats.find((c) => c.id === chatId) || null;
  }
}
