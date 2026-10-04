import { ChatsApi } from '../../api/chats/ChatsApi.js';
import { ApiError } from '../../api/ApiResponse.js';
import { ERROR_CODES } from '../../api/error.constants.js';
import { Sidebar } from '../../components/Sidebar.js';
import { ChatList } from '../../components/ChatList.js';
import { ChatArea } from '../../components/ChatArea.js';
import { debugError } from '../../helpers/error.js';

/**
 * Класс, представляющий страницу чатов.
 * Координирует работу всех компонентов страницы.
 */
export class ChatsPage {
  constructor() {
    this.chats = [];
    this.activeChat = null;
    this.isLoading = false;
    this.hasNetworkError = false;
    this.currentUser = {
      initials: 'ВМ',
      name: 'Вы',
    };

    this.sidebar = new Sidebar(this.currentUser);
    this.chatList = new ChatList();
    this.chatArea = new ChatArea();
  }

  async loadTemplates() {
    await Promise.all([this.chatList.loadTemplates(), this.chatArea.loadTemplates()]);
  }

  /**
   * Загрузка списка чатов с сервера
   */
  async loadChats() {
    this.isLoading = true;
    this.hasNetworkError = false;
    this.update();

    const response = await ChatsApi.getChats();

    if (response instanceof ApiError) {
      switch (response.code) {
        case ERROR_CODES.UNAUTHORIZED:
          window.location.href = '/login';
          return;
        case ERROR_CODES.NETWORK_ERROR:
          this.hasNetworkError = true;
          break;
        default:
          debugError(response.message);
      }
      this.chats = [];
    } else {
      this.chats = response.data?.items || [];
    }

    this.isLoading = false;
    this.update();
  }

  async retryLoadChats() {
    await this.loadChats();
  }

  update() {
    const root = document.getElementById('app');
    if (root) {
      root.innerHTML = this.render();
      this.bindEvents();
    }
  }

  bindEvents() {
    const retryButton = document.getElementById('retry-connection-btn');
    if (retryButton) {
      retryButton.addEventListener('click', () => this.retryLoadChats());
    }
  }

  setActiveChat(chatId) {
    this.activeChat = this.chats.find((c) => c.id === chatId) || null;
  }

  render() {
    return `
      <div class="min-h-screen bg-gray-50 flex">
        ${this.sidebar.render()}
        ${this.chatList.render(this.chats, this.activeChat?.id, this.isLoading)}
        ${this.chatArea.render(this.activeChat, this.chats, this.isLoading, this.hasNetworkError)}
      </div>
    `;
  }

  async mount() {
    await this.loadTemplates();
    await this.loadChats();
  }
}
