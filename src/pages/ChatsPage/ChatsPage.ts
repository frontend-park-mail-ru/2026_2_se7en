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
import { Signal } from '@/reactive/Signal';

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

  async loadTemplates(): Promise<void> {
    await Promise.all([this.chatList.loadTemplates(), this.chatArea.loadTemplates()]);
  }

  async loadCurrentUser(): Promise<boolean> {
    const response = await AuthApi.getCurrentUser();

    if (response instanceof ApiError) {
      if (response.status === STATUSES.UNAUTHORIZED) return false;

      debugError(response.message);
      return true;
    }

    this.currentUser.set({ name: response.data?.profile?.nickname || '' });

    return true;
  }

  /**
   * Загружает список чатов с сервера.
   */
  async loadChats(): Promise<void> {
    this.isLoading.set(true);
    this.hasNetworkError.set(false);

    const response = await ChatsApi.getChats();

    if (response instanceof ApiError) {
      if (response.status === STATUSES.UNAUTHORIZED) {
        return;
      }

      switch (response.code) {
        case ERROR_CODES.NETWORK_ERROR:
          this.hasNetworkError.set(true);
          break;
        default:
          debugError(response.message);
      }

      this.chats.set([]);
    } else {
      this.chats.set((response.data?.items ?? []).map(toDisplayChat));
    }

    this.isLoading.set(false);
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
    if (this.isLoggingOut.get()) return;

    this.isLoggingOut.set(true);
    this.logoutError.set(false);

    const result = await AuthApi.logout();

    if (result.success || result.status === STATUSES.UNAUTHORIZED) {
      await showPage(LoginPage);
      return;
    }

    this.isLoggingOut.set(false);
    this.logoutError.set(true);
  }

  setActiveChat(chatId: string): void {
    this.activeChat.set(this.chats.get().find((chat) => chat.id === chatId) ?? null);
  }

  render(): string {
    return `
      <div class="min-h-screen bg-gray-50 flex">
        ${this.sidebar.render()}
        ${this.chatList.render(this.chats.get(), this.activeChat.get(), this.isLoading.get())}
        ${this.chatArea.render(this.activeChat.get(), this.chats.get(), this.isLoading.get(), this.hasNetworkError.get())}
        ${
          this.logoutError.get()
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
