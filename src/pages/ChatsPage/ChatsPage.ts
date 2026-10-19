import { ChatsApi } from '@/api/chats/ChatsApi.js';
import { ApiError } from '@/api/ApiResponse.js';
import { ERROR_CODES } from '@/api/error.constants.js';
import { ChatList } from '@/components/chat/ChatList.js';
import { ChatArea } from '@/components/chat/ChatArea.js';
import { debugError } from '@/helpers/DebugError.js';
import { toDisplayChat } from '@/helpers/chat.js';
import { ROUTES } from '@/constants/Routes.js';
import { Page } from '@/pages/Page.js';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import type { DisplayChat } from '@/api/chats/chats.types.ts';
import { STATUSES } from '@/constants/Statuses';

export class ChatsPage extends Page {
  static route = ROUTES.HOME;

  private chats: DisplayChat[] = [];
  private activeChat: DisplayChat | null = null;
  private isLoading = true;
  private hasNetworkError = false;

  private readonly layout: DefaultLayout;
  private readonly chatList: ChatList;
  private readonly chatArea: ChatArea;

  constructor() {
    super();

    this.layout = new DefaultLayout();
    this.chatList = new ChatList();
    this.chatArea = new ChatArea();
  }

  unmount(): void {
    this.layout.unmount();
    super.unmount();
  }

  async loadTemplates(): Promise<void> {
    await Promise.all([this.chatList.loadTemplates(), this.chatArea.loadTemplates()]);
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
      if (response.status === STATUSES.UNAUTHORIZED) {
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

    this.layout.bindEvents();
  }

  setActiveChat(chatId: string): void {
    this.activeChat = this.chats.find((chat) => chat.id === chatId) ?? null;
  }

  render(): string {
    const content = `
      ${this.chatList.render(this.chats, this.activeChat?.id, this.isLoading)}
      ${this.chatArea.render(this.activeChat, this.chats, this.isLoading, this.hasNetworkError)}
    `;

    return this.layout.render(content);
  }

  async afterMount(): Promise<void> {
    await this.loadChats();
  }
}
