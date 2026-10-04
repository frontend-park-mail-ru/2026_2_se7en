import { ChatsApi } from '../../api/chats/ChatsApi.js';
import { AuthApi } from '../../api/auth/AuthApi.js';
import { ApiError } from '../../api/ApiResponse.js';
import { ERROR_CODES } from '../../api/error.constants.js';
import { Sidebar } from '../../components/chat/Sidebar.js';
import { ChatList } from '../../components/chat/ChatList.js';
import { ChatArea } from '../../components/chat/ChatArea.js';
import { debugError } from '../../helpers/debugError.js';
import { toDisplayChat } from '../../helpers/chat.js';
import { ROUTES } from '../../constants/Routes.js';
import { STATUSES } from '../../constants/Statuses.js';
import { Page } from '../Page.js';
import { showPage } from '../../helpers/showPage.js';
import { LoginPage } from '../LoginPage/LoginPage.js';

/**
 * Класс, представляющий страницу чатов.
 * Координирует работу всех компонентов страницы.
 */
export class ChatsPage extends Page {
  static route = ROUTES.HOME;

  constructor() {
    super();
    this.chats = [];
    this.activeChat = null;
    this.isLoading = true;
    this.hasNetworkError = false;
    this.logoutError = false;
    this.isLoggingOut = false;
    this.currentUser = {
      name: '',
    };

    this.sidebar = new Sidebar(this.currentUser);
    this.chatList = new ChatList();
    this.chatArea = new ChatArea();
  }

  async loadTemplates() {
    await Promise.all([this.chatList.loadTemplates(), this.chatArea.loadTemplates()]);
  }

  async loadCurrentUser() {
    const response = await AuthApi.getCurrentUser();
    if (response instanceof ApiError) {
      if (response.status === STATUSES.UNAUTHORIZED || response.code === ERROR_CODES.UNAUTHORIZED) {
        await showPage(LoginPage);
        return false;
      }

      debugError(response.message);
      return true;
    }

    this.currentUser.name = response.data?.profile?.first_name || '';
    await this.update();
    return true;
  }

  /**
   * Загрузка списка чатов с сервера
   */
  async loadChats() {
    this.isLoading = true;
    this.hasNetworkError = false;
    await this.update();

    const response = await ChatsApi.getChats();

    if (response instanceof ApiError) {
      if (response.status === STATUSES.UNAUTHORIZED || response.code === ERROR_CODES.UNAUTHORIZED) {
        await showPage(LoginPage);
        return;
      }

      switch (response.code) {
        case ERROR_CODES.NETWORK_ERROR:
          this.hasNetworkError = true;
          break;
        default:
          debugError(response.message);
      }
      this.chats = [];
    } else {
      this.chats = (response.data?.items || []).map(toDisplayChat);
    }

    this.isLoading = false;
    await this.update();
  }

  async update() {
    if (!this.container) return;
    this.container.innerHTML = await this.render();
    this.bindEvents();
  }

  bindEvents() {
    const retryButton = document.getElementById('retry-connection-btn');
    if (retryButton) {
      retryButton.addEventListener('click', () => this.loadChats());
    }

    document.getElementById('logout-button')?.addEventListener('click', (event) => {
      this.logout(event.currentTarget);
    });
  }

  async logout(button) {
    if (this.isLoggingOut) return;

    this.isLoggingOut = true;
    this.logoutError = false;
    button.disabled = true;

    const result = await AuthApi.logout();
    if (result.success || result.status === STATUSES.UNAUTHORIZED) {
      await showPage(LoginPage);
      return;
    }

    this.isLoggingOut = false;
    this.logoutError = true;
    await this.update();
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
        ${this.logoutError ? '<div role="alert" class="fixed right-4 top-4 rounded-xl bg-white border border-red-200 px-4 py-3 text-sm text-red-700 shadow-md">Не удалось выйти. Попробуйте ещё раз.</div>' : ''}
      </div>
    `;
  }

  async afterMount() {
    if (!(await this.loadCurrentUser())) return;
    await this.loadChats();
  }
}
