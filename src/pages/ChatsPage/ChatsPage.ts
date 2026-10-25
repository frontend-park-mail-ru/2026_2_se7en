import { ApiError } from '@/api/ApiResponse.js';
import { ChatArea } from '@/components/chat/ChatArea.js';
import { ChatList } from '@/components/chat/ChatList.js';
import { ChatsApi } from '@/api/chats/ChatsApi.js';
import { DefaultLayout } from '@/layouts/DefaultLayout.js';
import type { DisplayChat } from '@/api/chats/chats.types.ts';
import { ERROR_CODES } from '@/api/error.constants.js';
import { Page } from '@/pages/Page.js';
import { ROUTES } from '@/constants/Routes.js';
import { STATUSES } from '@/constants/Statuses.js';
import { Signal } from '@/reactive/Signal';
import { debugError } from '@/helpers/DebugError.js';
import { toDisplayChat } from '@/helpers/chat.js';

/**
 * Страница чатов: лейаут с боковой панелью, список чатов и область переписки.
 */
export class ChatsPage extends Page {
  static route = ROUTES.HOME;

  private chats = new Signal<DisplayChat[]>([]);
  private activeChat = new Signal<DisplayChat | null>(null);

  private isLoading = new Signal<boolean>(true);
  private hasNetworkError = new Signal<boolean>(false);

  private readonly layout: DefaultLayout;
  private readonly chatList: ChatList;
  private readonly chatArea: ChatArea;

  constructor() {
    super();

    this.layout = new DefaultLayout();
    this.chatList = new ChatList();
    this.chatArea = new ChatArea();

    this.setSubscribers(
      [this.chats, this.activeChat, this.isLoading, this.hasNetworkError],
      () => void this.update(),
    );
  }

  unmount(): void {
    this.layout.unmount();
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

    this.layout.bindEvents();
  }

  setActiveChat(chatId: string): void {
    this.activeChat.value = this.chats.value.find((chat) => chat.id === chatId) ?? null;
  }

  render(): string {
    return this.layout.render(`
      ${this.chatList.render(this.chats.value, this.activeChat.value, this.isLoading.value)}
      ${this.chatArea.render(this.activeChat.value, this.chats.value, this.isLoading.value, this.hasNetworkError.value)}
    `);
  }

  async afterMount(): Promise<void> {
    await this.loadChats();
  }
}
