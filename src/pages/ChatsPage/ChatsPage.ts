import { ApiError } from '@/api/ApiResponse.js';
import { AuthApi } from '@/api/auth/AuthApi.js';
import { ChatArea } from '@/components/chat/ChatArea.js';
import { ChatList } from '@/components/chat/ChatList.js';
import { ChatsApi } from '@/api/chats/ChatsApi.js';
import type { CurrentUser } from '@/api/auth/auth.types.ts';
import type { DisplayChat } from '@/api/chats/chats.types.ts';
import { ERROR_CODES } from '@/api/error.constants.js';
import { LoginPage } from '@/pages/LoginPage/LoginPage.js';
import { Page } from '@/pages/Page.js';
import { ROUTES } from '@/constants/Routes.js';
import { STATUSES } from '@/constants/Statuses.js';
import { Sidebar } from '@/components/chat/Sidebar.js';
import { Signal } from '@/reactive/Signal';
import { debugError } from '@/helpers/DebugError.js';
import { eventBus } from '@/helpers/EventBus';
import { showPage } from '@/helpers/ShowPage.ts';
import { toDisplayChat } from '@/helpers/chat.js';

/**
 * Страница чатов: боковая панель, список чатов и область переписки.
 */
export class ChatsPage extends Page {
  static route = ROUTES.HOME;

  private chats = new Signal<DisplayChat[]>([]);
  private activeChat = new Signal<DisplayChat | null>(null);

  private isLoading = new Signal<boolean>(true);
  private hasNetworkError = new Signal<boolean>(false);
  private logoutError = new Signal<boolean>(false);
  private isLoggingOut = new Signal<boolean>(false);

  currentUser = new Signal<CurrentUser>({ name: '' });

  private readonly sidebar: Sidebar;
  private readonly chatList: ChatList;
  private readonly chatArea: ChatArea;

  private offLogout?: () => void;

  constructor() {
    super();

    this.sidebar = new Sidebar(this.currentUser);
    this.chatList = new ChatList();
    this.chatArea = new ChatArea();

    this.chats.subscribe(() => void this.update());
    this.activeChat.subscribe(() => void this.update());
    this.isLoading.subscribe(() => void this.update());
    this.hasNetworkError.subscribe(() => void this.update());
    this.logoutError.subscribe(() => void this.update());
    this.isLoggingOut.subscribe(() => void this.update());
    this.currentUser.subscribe(() => void this.update());
  }

  unmount(): void {
    this.offLogout?.();
    this.offLogout = null;

    super.unmount();
  }

  async loadCurrentUser(): Promise<boolean> {
    const response = await AuthApi.getCurrentUser();

    if (response instanceof ApiError) {
      if (response.status === STATUSES.UNAUTHORIZED) return false;

      debugError(response.message);
      return true;
    }

    this.currentUser.value = { name: response.data?.profile?.nickname || '' };

    return true;
  }

  /**
   * Загружает список чатов с сервера.
   */
  async loadChats(): Promise<void> {
    this.isLoading.value = true;
    this.hasNetworkError.value = false;

    const response = await ChatsApi.getChats();

    if (response instanceof ApiError) {
      if (response.status === STATUSES.UNAUTHORIZED) {
        return;
      }

      switch (response.code) {
        case ERROR_CODES.NETWORK_ERROR:
          this.hasNetworkError.value = true;
          break;
        default:
          debugError(response.message);
      }

      this.chats.value = [];
    } else {
      this.chats.value = (response.data?.items ?? []).map(toDisplayChat);
    }

    this.isLoading.value = false;
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
    if (this.isLoggingOut.value) return;

    this.isLoggingOut.value = true;
    this.logoutError.value = false;

    const result = await AuthApi.logout();

    if (result.success || result.status === STATUSES.UNAUTHORIZED) {
      await showPage(LoginPage);
      return;
    }

    this.isLoggingOut.value = false;
    this.logoutError.value = true;
  }

  setActiveChat(chatId: string): void {
    this.activeChat.value = this.chats.value.find((chat) => chat.id === chatId) ?? null;
  }

  render(): string {
    return `
      <div class="min-h-screen bg-gray-50 flex">
        ${this.sidebar.render()}
        ${this.chatList.render(this.chats.value, this.activeChat.value, this.isLoading.value)}
        ${this.chatArea.render(this.activeChat.value, this.chats.value, this.isLoading.value, this.hasNetworkError.value)}
        ${
          this.logoutError.value
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
    this.offLogout = eventBus.on('user:logout', this.handleLogout.bind(this));

    if (!(await this.loadCurrentUser())) return;

    await this.loadChats();
  }
}
