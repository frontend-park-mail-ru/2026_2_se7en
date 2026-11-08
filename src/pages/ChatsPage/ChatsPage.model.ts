import { ChatsApi } from '@/api/chats/ChatsApi.ts';
import { ERROR_CODES } from '@/api/error.constants.ts';
import { STATUSES } from '@/constants/Statuses.ts';
import { Signal } from '@/reactive/Signal.ts';
import { WebSocketApi } from '@/api/ws/WebSocketApi.ts';
import type { WsServerEvent } from '@/api/ws/ws.types.ts';
import { debugError } from '@/helpers/DebugError.ts';
import { eventBus } from '@/helpers/EventBus.ts';
import { user } from '@/store/User.ts';
import { ApiError, type ApiResult } from '@/api/ApiResponse.ts';
import type {
  ChatDetailResponse,
  ChatMember,
  ChatMessage,
  DisplayChat,
} from '@/api/chats/chats.types.ts';
import { sortChatsByLastMessage, toDisplayChat } from '@/helpers/chat.ts';
import { REMOTE_TYPING_TIMEOUT_MS, TYPING_IDLE_MS } from './chats.constants.ts';

export class ChatsPageModel {
  readonly chats = new Signal<DisplayChat[]>([]);
  readonly activeChat = new Signal<DisplayChat | null>(null);
  readonly role = new Signal<'creator' | 'admin' | 'member' | null>(null);
  readonly messages = new Signal<ChatMessage[]>([]);
  readonly members = new Signal<ChatMember[]>([]);
  readonly typingUsers = new Signal<string[]>([]);
  readonly isLoading = new Signal(true);
  readonly hasNetworkError = new Signal(false);
  readonly messagesLoading = new Signal(false);
  readonly messagesError = new Signal('');
  readonly membersLoading = new Signal(false);
  readonly membersError = new Signal('');
  readonly sendError = new Signal('');
  readonly sending = new Signal(false);
  readonly hasMoreMessages = new Signal(false);

  private selectedChatId: string | null = null;
  private selectionVersion = 0;
  private isFetching = false;
  private pendingChatsRefresh = false;
  private catchUpAfterMessageLoad = false;
  private unreadRefreshVersion = 0;
  private localTypingChatId: string | null = null;
  private localTypingTimer: number | null = null;
  private readonly remoteTypingTimers = new Map<string, number>();

  private readonly socket = new WebSocketApi(
    (event) => this.handleSocketEvent(event),
    (error) => debugError(`WebSocket: ${String(error)}`),
    (reconnected) => {
      this.markMessagesRead(this.selectedChatId, this.messages.value);
      if (reconnected) {
        void this.reconcileAfterReconnect();
      }
    },
  );

  private readonly offLoad: () => void;
  private readonly offSelect: () => void;

  constructor() {
    this.offLoad = eventBus.on('chats:load', () => {
      void this.loadChats(true);
    });

    this.offSelect = eventBus.on('chats:select', ({ id }) => {
      void this.selectChat(id);
    });
  }

  start(): void {
    this.socket.connect();
    void this.loadChats(true);
  }

  destroy(): void {
    this.unreadRefreshVersion += 1;
    this.stopTyping();
    this.clearRemoteTyping();
    this.offLoad();
    this.offSelect();
    this.socket.disconnect();
  }

  async loadChats(showLoading = false): Promise<void> {
    if (this.isFetching) {
      this.pendingChatsRefresh = true;
      return;
    }
    this.isFetching = true;

    if (showLoading) {
      this.isLoading.value = true;
    }
    this.hasNetworkError.value = false;

    const response = await ChatsApi.getChats();

    if (response instanceof ApiError) {
      if (response.status !== STATUSES.UNAUTHORIZED) {
        if (response.code === ERROR_CODES.NETWORK_ERROR) {
          this.hasNetworkError.value = true;
        } else {
          debugError(response.message);
        }
      }

      if (showLoading) {
        this.chats.value = [];
      }
    } else {
      const previousCounts = new Map(this.chats.value.map((chat) => [chat.id, chat.unreadCount]));
      const next = sortChatsByLastMessage(
        (response.data?.items ?? []).map((chat) => {
          const displayChat = toDisplayChat(chat);
          displayChat.unreadCount = previousCounts.get(chat.id) ?? 0;
          return displayChat;
        }),
      );
      const nextIds = new Set(next.map((chat) => chat.id).filter((id): id is string => !!id));

      for (const chat of this.chats.value) {
        if (chat.id && !nextIds.has(chat.id)) {
          this.socket.unsubscribe(chat.id);
        }
      }

      for (const chat of next) {
        if (chat.id) {
          this.socket.subscribe(chat.id);
        }
      }

      this.chats.value = next;
      void this.refreshUnreadCounts(next);

      if (this.selectedChatId) {
        const selected = next.find((chat) => chat.id === this.selectedChatId);
        if (selected) {
          this.activeChat.value = selected;
        }
      }
    }

    this.isLoading.value = false;
    this.isFetching = false;
    if (this.pendingChatsRefresh) {
      this.pendingChatsRefresh = false;
      await this.loadChats(false);
    }
  }

  async selectChat(id: string): Promise<void> {
    if (this.selectedChatId !== id) {
      this.stopTyping();
      this.clearRemoteTyping();
    }
    this.selectedChatId = id;
    const version = ++this.selectionVersion;
    this.setUnreadCount(id, 0);

    this.activeChat.value = this.chats.value.find((chat) => chat.id === id) ?? null;
    this.role.value = null;
    this.messages.value = [];
    this.members.value = [];
    this.messagesError.value = '';
    this.membersError.value = '';
    this.sendError.value = '';
    this.hasMoreMessages.value = false;

    this.messagesLoading.value = true;
    const detail = await ChatsApi.getChat(id);

    if (version !== this.selectionVersion) {
      return;
    }

    if (detail instanceof ApiError) {
      this.messagesError.value = detail.message;
      this.messagesLoading.value = false;
      return;
    }

    if (detail.data?.chat) {
      const existing = this.chats.value.find((chat) => chat.id === id);
      this.activeChat.value = toDisplayChat({
        ...existing,
        ...detail.data.chat,
      });
      this.role.value = detail.data.role;
    }

    this.socket.subscribe(id);
    await Promise.all([this.loadMessages(id, version), this.loadMembers(id, version)]);
  }

  async loadMessages(id = this.selectedChatId, version = this.selectionVersion): Promise<void> {
    if (!id) {
      return;
    }

    this.messagesLoading.value = true;
    this.messagesError.value = '';

    const result = await ChatsApi.getMessages(id);
    if (version !== this.selectionVersion) {
      return;
    }

    if (result instanceof ApiError) {
      this.messagesError.value = result.message;
    } else {
      const items = result.data?.items ?? [];
      this.messages.value = [...items].reverse();
      this.hasMoreMessages.value = items.length === 50;
      this.markMessagesRead(id, items);
    }

    this.messagesLoading.value = false;
    if (this.catchUpAfterMessageLoad) {
      this.catchUpAfterMessageLoad = false;
      void this.catchUpActiveMessages();
    }
  }

  async loadOlderMessages(): Promise<void> {
    const id = this.selectedChatId;
    const oldest = this.messages.value[0];
    if (!id || !oldest || !this.hasMoreMessages.value) {
      return;
    }

    const version = this.selectionVersion;
    const result = await ChatsApi.getMessages(id, oldest.id);
    if (version !== this.selectionVersion) {
      return;
    }

    if (result instanceof ApiError) {
      this.messagesError.value = result.message;
      return;
    }

    const items = result.data?.items ?? [];
    this.messages.value = [...items].reverse().concat(this.messages.value);
    this.hasMoreMessages.value = items.length === 50;
    this.markMessagesRead(id, items);
  }

  async loadMembers(id = this.selectedChatId, version = this.selectionVersion): Promise<void> {
    if (!id) {
      return;
    }

    this.membersLoading.value = true;
    this.membersError.value = '';

    const result = await ChatsApi.getMembers(id);
    if (version !== this.selectionVersion) {
      return;
    }

    if (result instanceof ApiError) {
      this.membersError.value = result.message;
    } else {
      this.members.value = result.data?.items ?? [];
    }

    this.membersLoading.value = false;
  }

  private async reconcileAfterReconnect(): Promise<void> {
    await this.loadChats(false);
    if (this.messagesLoading.value) {
      this.catchUpAfterMessageLoad = true;
      return;
    }
    await this.catchUpActiveMessages();
  }

  private async catchUpActiveMessages(): Promise<void> {
    const chatId = this.selectedChatId;
    if (!chatId || this.messagesLoading.value) {
      return;
    }

    const version = this.selectionVersion;
    const currentMessages = this.messages.value;
    const knownMessageId = currentMessages[currentMessages.length - 1]?.id;
    const missed: ChatMessage[] = [];
    let before: string | undefined;
    let reachedKnownMessage = false;
    let reachedHistoryStart = false;

    while (!reachedKnownMessage && !reachedHistoryStart) {
      const result = await ChatsApi.getMessages(chatId, before);
      if (version !== this.selectionVersion) {
        return;
      }

      if (result instanceof ApiError) {
        debugError(`Не удалось догрузить сообщения после восстановления связи: ${result.message}`);
        return;
      }

      const page = result.data?.items ?? [];
      for (const message of page) {
        if (message.id === knownMessageId) {
          reachedKnownMessage = true;
          break;
        }
        missed.push(message);
      }

      reachedHistoryStart = page.length < 50;
      if (reachedKnownMessage || reachedHistoryStart) {
        break;
      }

      const nextBefore = page[page.length - 1]?.id;
      if (!nextBefore || nextBefore === before) {
        break;
      }
      before = nextBefore;
    }

    if (version !== this.selectionVersion) {
      return;
    }

    if (missed.length) {
      const byId = new Map(this.messages.value.map((message) => [message.id, message]));
      for (const message of missed) byId.set(message.id, message);

      this.messages.value = [...byId.values()].sort((left, right) => {
        const dateDifference = Date.parse(left.created_at) - Date.parse(right.created_at);
        return dateDifference || left.id.localeCompare(right.id);
      });
      this.markMessagesRead(chatId, missed);
    }

    if (reachedHistoryStart && !knownMessageId) {
      this.hasMoreMessages.value = false;
    }
  }

  async sendMessage(content: string): Promise<boolean> {
    const id = this.selectedChatId;
    const text = content.trim();

    if (!id || !text || this.sending.value) {
      return false;
    }

    this.stopTyping();
    this.sending.value = true;
    this.sendError.value = '';

    const result = await ChatsApi.sendMessage(id, text);
    this.sending.value = false;

    if (result instanceof ApiError) {
      this.sendError.value = result.message;
      return false;
    }

    if (result.data) {
      this.acceptMessage(result.data);
    }
    return true;
  }

  updateTyping(value: string): void {
    const chatId = this.selectedChatId;
    if (!chatId || !value.trim()) {
      this.stopTyping();
      return;
    }

    if (this.localTypingChatId !== chatId) {
      this.stopTyping();
      if (this.socket.send({ type: 'typing.start', chat_id: chatId })) {
        this.localTypingChatId = chatId;
      }
    }

    window.clearTimeout(this.localTypingTimer ?? undefined);
    this.localTypingTimer = window.setTimeout(() => this.stopTyping(), TYPING_IDLE_MS);
  }

  stopTyping(): void {
    window.clearTimeout(this.localTypingTimer ?? undefined);
    this.localTypingTimer = null;

    const chatId = this.localTypingChatId;
    this.localTypingChatId = null;
    if (chatId) {
      this.socket.send({ type: 'typing.stop', chat_id: chatId });
    }
  }

  private removeRemoteTypingUser(userId: string): void {
    const timer = this.remoteTypingTimers.get(userId);
    if (timer === undefined) {
      return;
    }

    window.clearTimeout(timer);
    this.remoteTypingTimers.delete(userId);
    this.typingUsers.value = this.typingUsers.value.filter((id) => id !== userId);
  }

  private clearRemoteTyping(): void {
    for (const timer of this.remoteTypingTimers.values()) window.clearTimeout(timer);
    this.remoteTypingTimers.clear();
    if (this.typingUsers.value.length > 0) {
      this.typingUsers.value = [];
    }
  }

  async createGroup(
    name: string,
    description: string,
    members: string[],
  ): Promise<ApiResult<ChatDetailResponse>> {
    const result = await ChatsApi.createGroup({
      name,
      description: description || undefined,
      members,
    });

    if (result.success && result.data?.chat?.id) {
      await this.loadChats(false);
      await this.selectChat(result.data.chat.id);
    }

    return result;
  }

  async updateGroup(
    name: string,
    description: string,
  ): Promise<ApiResult<ChatDetailResponse> | null> {
    const id = this.selectedChatId;
    if (!id) {
      return null;
    }

    const result = await ChatsApi.updateGroup(id, {
      name,
      description: description || null,
      set_description: true,
    });

    if (result.success) {
      await this.loadChats(false);
      await this.selectChat(id);
    }

    return result;
  }

  async deleteChat(): Promise<ApiResult<void> | null> {
    const id = this.selectedChatId;
    if (!id) {
      return null;
    }

    const result = await ChatsApi.deleteChat(id);
    if (result.success) {
      this.removeCurrentChat();
    }
    return result;
  }

  async leaveGroup(): Promise<ApiResult<void> | null> {
    const id = this.selectedChatId;
    if (!id) {
      return null;
    }

    const result = await ChatsApi.leaveGroup(id);
    if (result.success) {
      this.removeCurrentChat();
    }
    return result;
  }

  async removeMember(userId: string): Promise<ApiResult<void> | null> {
    const id = this.selectedChatId;
    if (!id) {
      return null;
    }

    const result = await ChatsApi.removeMember(id, userId);
    if (result.success) {
      await Promise.all([this.loadMembers(id), this.loadChats(false)]);
    }
    return result;
  }

  private removeCurrentChat(): void {
    this.stopTyping();
    this.clearRemoteTyping();
    const id = this.selectedChatId;
    if (id) {
      this.socket.unsubscribe(id);
      this.chats.value = this.chats.value.filter((chat) => chat.id !== id);
    }

    this.selectedChatId = null;
    this.selectionVersion += 1;
    this.activeChat.value = null;
    this.role.value = null;
    this.messages.value = [];
    this.members.value = [];
  }

  private setUnreadCount(chatId: string, count: number): void {
    if (this.chats.value.find((chat) => chat.id === chatId)?.unreadCount === count) {
      return;
    }
    this.chats.value = this.chats.value.map((chat) =>
      chat.id === chatId ? { ...chat, unreadCount: count } : chat,
    );
  }

  private markMessagesRead(chatId: string | null, messages: ChatMessage[]): void {
    if (!chatId) {
      return;
    }
    const currentUserId = user.getId();
    if (!currentUserId) {
      return;
    }

    for (const message of messages) {
      if (message.user_id !== currentUserId && !message.is_read) {
        this.socket.send({
          type: 'message.mark_read',
          chat_id: chatId,
          message_id: message.id,
        });
      }
    }
  }

  private async refreshUnreadCounts(chats: DisplayChat[]): Promise<void> {
    const currentUserId = user.getId();
    if (!currentUserId) {
      return;
    }

    const version = ++this.unreadRefreshVersion;
    const queue = chats.filter((chat) => chat.id && chat.last_message);
    const counts = new Map<string, { messageId: string | undefined; count: number }>();
    let index = 0;

    const worker = async (): Promise<void> => {
      while (index < queue.length && version === this.unreadRefreshVersion) {
        const chat = queue[index++];
        const chatId = chat.id;
        if (!chatId) {
          continue;
        }

        let before: string | undefined;
        let unreadCount = 0;
        let complete = false;

        while (!complete && version === this.unreadRefreshVersion) {
          const response = await ChatsApi.getMessages(chatId, before);
          if (response instanceof ApiError) {
            break;
          }

          const page = response.data?.items ?? [];
          unreadCount += page.filter(
            (message) => message.user_id !== currentUserId && !message.is_read,
          ).length;
          complete = page.length < 50;
          before = page[page.length - 1]?.id;
          if (!before) {
            complete = true;
          }
        }

        if (version !== this.unreadRefreshVersion || !complete) {
          continue;
        }

        counts.set(chatId, { messageId: chat.last_message?.id, count: unreadCount });
      }
    };

    await Promise.all(Array.from({ length: Math.min(4, queue.length) }, () => worker()));
    if (version !== this.unreadRefreshVersion) {
      return;
    }

    let changed = false;
    const updated = this.chats.value.map((chat) => {
      const result = counts.get(chat.id ?? '');
      if (!result || chat.last_message?.id !== result.messageId) {
        return chat;
      }

      const count = this.selectedChatId === chat.id ? 0 : result.count;
      if (chat.unreadCount === count) {
        return chat;
      }

      changed = true;
      return { ...chat, unreadCount: count };
    });

    if (changed) {
      this.chats.value = updated;
    }
  }

  private acceptMessage(message: ChatMessage): void {
    const id = message.chat_id;

    if (this.selectedChatId === id) {
      this.removeRemoteTypingUser(message.user_id);
      const exists = this.messages.value.some((item) => item.id === message.id);
      if (!exists) {
        this.messages.value = [...this.messages.value, message];
      }
      this.markMessagesRead(id, [message]);
    }

    const updated = this.chats.value.map((chat) => {
      if (chat.id !== id) {
        return chat;
      }

      return {
        ...toDisplayChat({
          ...chat,
          last_message: {
            id: message.id,
            content: message.content,
            type: message.type,
            created_at: message.created_at,
          },
        }),
        unreadCount:
          chat.unreadCount +
          (this.selectedChatId !== id &&
          message.user_id !== user.getId() &&
          chat.last_message?.id !== message.id
            ? 1
            : 0),
      };
    });

    this.chats.value = sortChatsByLastMessage(updated);

    if (this.activeChat.value?.id === id) {
      this.activeChat.value =
        this.chats.value.find((chat) => chat.id === id) ?? this.activeChat.value;
    }
  }

  private handleSocketEvent(event: WsServerEvent): void {
    if (event.type === 'typing.started' || event.type === 'typing.stopped') {
      const payload = event.payload;
      if (
        !payload ||
        typeof payload !== 'object' ||
        !('chat_id' in payload) ||
        !('user_id' in payload) ||
        typeof payload.chat_id !== 'string' ||
        typeof payload.user_id !== 'string' ||
        payload.chat_id !== this.selectedChatId ||
        payload.user_id === user.getId()
      )
        return;

      const typingUserId = payload.user_id;
      if (event.type === 'typing.stopped') {
        this.removeRemoteTypingUser(typingUserId);
        return;
      }

      const previousTimer = this.remoteTypingTimers.get(typingUserId);
      if (previousTimer !== undefined) {
        window.clearTimeout(previousTimer);
      }
      const timer = window.setTimeout(
        () => this.removeRemoteTypingUser(typingUserId),
        REMOTE_TYPING_TIMEOUT_MS,
      );
      this.remoteTypingTimers.set(typingUserId, timer);
      if (!this.typingUsers.value.includes(typingUserId)) {
        this.typingUsers.value = [...this.typingUsers.value, typingUserId];
      }
      return;
    }

    if (event.type === 'message.created') {
      const payload = event.payload;
      if (
        payload &&
        typeof payload === 'object' &&
        'id' in payload &&
        'chat_id' in payload &&
        typeof payload.id === 'string' &&
        typeof payload.chat_id === 'string'
      ) {
        this.acceptMessage(payload as ChatMessage);
      }
      return;
    }

    if (event.type === 'message.read') {
      const payload = event.payload;
      if (
        payload &&
        typeof payload === 'object' &&
        'chat_id' in payload &&
        'message_id' in payload &&
        'user_id' in payload &&
        typeof payload.chat_id === 'string' &&
        typeof payload.message_id === 'string' &&
        typeof payload.user_id === 'string'
      ) {
        if (payload.chat_id === this.selectedChatId && payload.user_id !== user.getId()) {
          const message = this.messages.value.find((item) => item.id === payload.message_id);
          if (message?.user_id === user.getId() && !message.is_read) {
            this.messages.value = this.messages.value.map((item) =>
              item.id === payload.message_id ? { ...item, is_read: true } : item,
            );
          }
        }

        if (payload.user_id === user.getId()) {
          const chat = this.chats.value.find((item) => item.id === payload.chat_id);
          if (chat && chat.unreadCount > 0) {
            this.setUnreadCount(payload.chat_id, chat.unreadCount - 1);
          }
        }
      }
      return;
    }

    if (
      event.type === 'chat.created' ||
      event.type === 'chat.updated' ||
      event.type === 'chat.deleted'
    ) {
      void this.loadChats(false);
      return;
    }

    if (event.type === 'member.added' || event.type === 'member.deleted') {
      void this.loadChats(false);
      void this.loadMembers();
    }
  }
}
