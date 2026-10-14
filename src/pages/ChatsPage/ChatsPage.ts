import { ChatsApi } from '@/api/chats/ChatsApi.js';
import { AuthApi } from '@/api/auth/AuthApi.js';
import { ApiError } from '@/api/ApiResponse.js';
import { ERROR_CODES } from '@/api/error.constants.js';
import { Sidebar } from '@/components/chat/Sidebar.js';
import { ChatList } from '@/components/chat/ChatList.js';
import { ChatArea } from '@/components/chat/ChatArea.js';
import { debugError } from '@/helpers/DebugError.js';
import { toDisplayChat } from '@/helpers/chat.js';
import { ROUTES } from '@/constants/Routes.js';
import { STATUSES } from '@/constants/Statuses.js';
import { Page } from '@/pages/Page.js';
import { showPage } from '@/helpers/ShowPage.ts';
import { LoginPage } from '@/pages/LoginPage/LoginPage.js';
import type { DisplayChat } from '@/api/chats/chats.types.ts';
import type { CurrentUser } from '@/api/auth/auth.types.ts';
import { eventBus } from '@/helpers/EventBus';

export class ChatsPage extends Page {
  static route = ROUTES.HOME;

  private chats: DisplayChat[] = [];
  private activeChat: DisplayChat | null = null;

  private isLoading = true;
  private hasNetworkError = false;
  private logoutError = false;
  private isLoggingOut = false;

  currentUser: CurrentUser = {
    name: '',
  };

  private readonly sidebar: Sidebar;
  private readonly chatList: ChatList;
  private readonly chatArea: ChatArea;

  private offLogout?: () => void;

  constructor() {
    super();

    this.sidebar = new Sidebar(this.currentUser);
    this.chatList = new ChatList();
    this.chatArea = new ChatArea();
  }

  unmount(): void {
    this.offLogout?.();
    this.offLogout = undefined;

    super.unmount();
  }

  async loadTemplates(): Promise<void> {
    await Promise.all([this.chatList.loadTemplates(), this.chatArea.loadTemplates()]);
  }

  async loadCurrentUser(): Promise<boolean> {
    const response = await AuthApi.getCurrentUser();

    if (response instanceof ApiError) {
      if (response.status === STATUSES.UNAUTHORIZED || response.code === ERROR_CODES.UNAUTHORIZED) {
        await showPage(LoginPage);
        return false;
      }

      debugError(response.message);
      return true;
    }

    this.currentUser.name = response.data?.profile?.nickname || '';

    await this.update();

    return true;
  }

  /**
   * Загружает список чатов с сервера.
   */
  async loadChats(): Promise<void> {
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
      this.chats = (response.data?.items ?? []).map(toDisplayChat);
    }

    this.isLoading = false;

    await this.update();
  }

  async update(): Promise<void> {
    if (!this.container) return;

    this.container.innerHTML = this.render();
    this.bindEvents();
  }

  bindEvents(): void {
    const retryButton = document.getElementById('retry-connection-btn');

    retryButton?.addEventListener('click', () => {
      void this.loadChats();
    });

    this.sidebar.bindEvents();
  }

  async handleLogout(): Promise<void> {
    if (this.isLoggingOut) return;

    this.isLoggingOut = true;
    this.logoutError = false;

    const result = await AuthApi.logout();

    if (result.success || result.status === STATUSES.UNAUTHORIZED) {
      await showPage(LoginPage);
      return;
    }

    this.isLoggingOut = false;
    this.logoutError = true;

    await this.update();
  }

  setActiveChat(chatId: string): void {
    this.activeChat = this.chats.find((chat) => chat.id === chatId) ?? null;
  }

  render(): string {
    return `
      <div class="min-h-screen bg-gray-50 flex">
        ${this.sidebar.render()}
        ${this.chatList.render(this.chats, this.activeChat?.id, this.isLoading)}
        ${this.chatArea.render(this.activeChat, this.chats, this.isLoading, this.hasNetworkError)}
        ${
          this.logoutError
            ? `
              <div
                role="alert"
                class="fixed right-4 top-4 rounded-xl bg-white border border-red-200 px-4 py-3 text-sm text-red-700 shadow-md"
              >
                Не удалось выйти. Попробуйте ещё раз.
              </div>
            `
            : ''
        }
      </div>
    `;
  }

  async afterMount(): Promise<void> {
    this.offLogout = eventBus.on('user:logout', () => {
      void this.handleLogout();
    });

    if (!(await this.loadCurrentUser())) return;

    await this.loadChats();
  }
}
