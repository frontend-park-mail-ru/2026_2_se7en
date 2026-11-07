import { ApiError } from '@/api/ApiResponse.ts';
import { ChatsApi } from '@/api/chats/ChatsApi.ts';
import type { DisplayChat } from '@/api/chats/chats.types.ts';
import { ERROR_CODES } from '@/api/error.constants.ts';
import { STATUSES } from '@/constants/Statuses.ts';
import { Signal } from '@/reactive/Signal.ts';
import { debugError } from '@/helpers/DebugError.ts';
import { eventBus } from '@/helpers/EventBus.ts';
import { toDisplayChat } from '@/helpers/chat.ts';

/**
 * Модель страницы чатов.
 *
 * Связь с View:
 * - View → Model: EventBus (`chats:load`, `chats:select`).
 * - Model → View: Signal (View подписан на изменения стейта).
 */
export class ChatsPageModel {
  readonly chats = new Signal<DisplayChat[]>([]);
  readonly activeChat = new Signal<DisplayChat | null>(null);
  readonly isLoading = new Signal<boolean>(true);
  readonly hasNetworkError = new Signal<boolean>(false);

  /** Защита от двойного запроса, если retry нажали быстро. */
  private isFetching = false;

  private readonly offLoad: () => void;
  private readonly offSelect: () => void;

  constructor() {
    this.offLoad = eventBus.on('chats:load', () => {
      void this.loadChats();
    });

    this.offSelect = eventBus.on('chats:select', ({ id }) => {
      this.selectChat(id);
    });
  }

  destroy(): void {
    this.offLoad();
    this.offSelect();
  }

  private selectChat(id: string): void {
    const chat = this.chats.value.find((c) => c.id === id) ?? null;
    this.activeChat.value = chat;
  }

  private async loadChats(): Promise<void> {
    if (this.isFetching) return;
    this.isFetching = true;

    this.isLoading.value = true;
    this.hasNetworkError.value = false;

    const response = await ChatsApi.getChats();

    if (response instanceof ApiError) {
      if (response.status === STATUSES.UNAUTHORIZED) {
        this.isFetching = false;
        return;
      }

      if (response.code === ERROR_CODES.NETWORK_ERROR) {
        this.hasNetworkError.value = true;
      } else {
        debugError(response.message);
      }

      this.chats.value = [];
    } else {
      this.chats.value = (response.data?.items ?? []).map(toDisplayChat);
    }

    this.isLoading.value = false;
    this.isFetching = false;
  }
}
