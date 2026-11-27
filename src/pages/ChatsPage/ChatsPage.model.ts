import type { ChatFilter } from '@/components/chat/chat.types.ts';
import { ChatsApi } from '@/api/chats/ChatsApi.ts';
import { ERROR_CODES } from '@/api/error.constants.ts';
import type { PageDirection } from '@/helpers/PagedWindow.ts';
import { PagedWindow } from '@/helpers/PagedWindow.ts';
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
  MessageCursor,
} from '@/api/chats/chats.types.ts';
import { REMOTE_TYPING_TIMEOUT_MS, TYPING_IDLE_MS } from './chats.constants.ts';
import { sortChatsByLastMessage, toDisplayChat } from '@/helpers/chat.ts';

const CHATS_PAGE_SIZE = 20;
const MESSAGES_PAGE_SIZE = 50;
type ChatCursor = { after_time: string; after_id: string };

export class ChatsPageModel {
  readonly chats = new Signal<DisplayChat[]>([]);
  readonly activeChat = new Signal<DisplayChat | null>(null);
  readonly role = new Signal<'creator' | 'admin' | 'member' | null>(null);
  readonly messages = new Signal<ChatMessage[]>([]);
  readonly firstUnreadId = new Signal<string | undefined>(undefined);
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
  readonly messagePagination = new PagedWindow<ChatMessage, MessageCursor>((cursor) =>
    this.fetchMessages(cursor),
  );

  private selectedChatId: string | null = null;
  private selectionVersion = 0;
  private dialogRequestVersion = 0;
  private chatFilter: ChatFilter = 'all';
  private chatListVersion = 0;
  private destroyed = false;
  private pendingChatsRefresh = false;
  private readonly chatEventVersions = new Map<string, number>();
  private refreshAfterMessageLoad = false;
  private pendingMessages: ChatMessage[] = [];
  readonly chatPagination = new PagedWindow<DisplayChat & { id: string }, ChatCursor>((cursor) =>
    this.fetchChats(cursor, this.chatFilter, this.chatListVersion),
  );

  private activityTimer: number | null = null;
  private presenceTimer: number | null = null;
  private localTypingChatId: string | null = null;
  private localTypingTimer: number | null = null;
  private readonly remoteTypingTimers = new Map<string, number>();

  private readonly socket = new WebSocketApi(
    (event) => this.handleSocketEvent(event),
    (error) => debugError(`WebSocket: ${String(error)}`),
    (reconnected) => {
      if (reconnected) {
        void this.reconcileAfterReconnect();
      }
    },
  );

  private readonly offLoad: () => void;
  private readonly offSelect: () => void;

  constructor() {
    this.messagePagination.items.subscribe(() => {
      this.messages.value = [...this.messagePagination.items.value].reverse();
    });
    this.chatPagination.items.subscribe(() => {
      this.chats.value = sortChatsByLastMessage(this.chatPagination.items.value);
      const selected = this.chats.value.find((chat) => chat.id === this.selectedChatId);
      if (selected) this.activeChat.value = selected;
    });
    this.offLoad = eventBus.on('chats:load', () => {
      void this.loadChats(true);
    });

    this.offSelect = eventBus.on('chats:select', ({ id }) => {
      void this.selectChat(id);
    });
  }

  start(loadInitially = true): void {
    this.socket.connect();
    if (loadInitially) void this.loadChats(true);
    this.presenceTimer = window.setInterval(() => {
      if (!document.hidden) void this.loadChats(false);
    }, 10000);
  }

  destroy(): void {
    this.destroyed = true;
    window.clearInterval(this.presenceTimer ?? undefined);
    this.chatListVersion += 1;
    this.chatPagination.reset();
    this.dialogRequestVersion += 1;
    this.selectionVersion += 1;
    this.resetMessages();
    window.clearTimeout(this.activityTimer ?? undefined);
    this.stopTyping();
    this.clearRemoteTyping();
    this.offLoad();
    this.offSelect();
    this.socket.disconnect();
  }

  searchMessages(chatId: string, query: string, before?: string) {
    return ChatsApi.getMessages(chatId, before, query);
  }

  private async fetchChats(cursor: ChatCursor | null, filter: ChatFilter, version: number) {
    const items: (DisplayChat & { id: string })[] = [];
    const type = filter === 'dialog' || filter === 'group' ? filter : undefined;
    do {
      const response = await ChatsApi.getChats({
        ...cursor,
        type,
        limit: CHATS_PAGE_SIZE - items.length,
      });
      if (response instanceof ApiError) return response;
      if (version !== this.chatListVersion) return { items: [], next: null };

      for (const chat of response.data?.items ?? []) {
        if (!chat.id || (filter === 'unread' && !chat.unread_count)) continue;
        items.push({ ...toDisplayChat(chat), id: chat.id });
      }
      cursor =
        response.data?.next_after_time && response.data?.next_after_id
          ? { after_time: response.data.next_after_time, after_id: response.data.next_after_id }
          : null;
    } while (filter === 'unread' && cursor && items.length < CHATS_PAGE_SIZE);
    return { items, next: cursor };
  }

  setChatFilter(filter: ChatFilter): void {
    if (filter === this.chatFilter) return;
    this.chatFilter = filter;
    this.chatListVersion += 1;
    this.pendingChatsRefresh = false;
    this.chatPagination.reset();
    void this.loadChats(true);
  }

  async loadChats(showLoading = false): Promise<void> {
    if (this.destroyed) return;
    if (this.chatPagination.state.value.pending) {
      this.pendingChatsRefresh = true;
      return;
    }
    const version = this.chatListVersion;
    if (showLoading) this.isLoading.value = true;
    this.hasNetworkError.value = false;

    const response = await this.chatPagination.load('refresh');
    if (version !== this.chatListVersion) return;
    if (response instanceof ApiError && response.status !== STATUSES.UNAUTHORIZED) {
      if (response.code === ERROR_CODES.NETWORK_ERROR && this.chats.value.length === 0) {
        this.hasNetworkError.value = true;
      } else {
        debugError(response.message);
      }
    }

    this.isLoading.value = false;
    await this.flushChatsRefresh();
  }

  async loadMoreChats(direction: PageDirection): Promise<void> {
    await this.chatPagination.load(direction);
    await this.flushChatsRefresh();
  }

  private async flushChatsRefresh(): Promise<void> {
    if (!this.pendingChatsRefresh || this.chatPagination.state.value.pending) return;
    this.pendingChatsRefresh = false;
    await this.loadChats();
  }

  async selectChat(id: string, messageId?: string): Promise<boolean> {
    if (this.selectedChatId !== id) {
      this.stopTyping();
      this.clearRemoteTyping();
    }
    this.selectedChatId = id;
    const version = ++this.selectionVersion;

    this.activeChat.value = this.chats.value.find((chat) => chat.id === id) ?? null;
    this.role.value = null;
    this.resetMessages(!messageId);
    this.members.value = [];
    this.messagesError.value = '';
    this.membersError.value = '';
    this.sendError.value = '';

    this.messagesLoading.value = true;
    const detail = await ChatsApi.getChat(id);

    if (version !== this.selectionVersion) {
      return false;
    }

    if (detail instanceof ApiError) {
      this.messagesError.value = detail.message;
      this.messagesLoading.value = false;
      return false;
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

    if (messageId && version === this.selectionVersion) {
      while (
        !this.messages.value.some((message) => message.id === messageId) &&
        this.messagePagination.state.value.next &&
        !this.messagesError.value
      ) {
        const oldestId = this.messages.value[0]?.id;
        await this.loadMoreMessages('next');
        if (version !== this.selectionVersion || this.messages.value[0]?.id === oldestId) {
          break;
        }
      }
    }

    return (
      version === this.selectionVersion &&
      (!messageId || this.messages.value.some((message) => message.id === messageId))
    );
  }

  private async fetchMessages(cursor: MessageCursor | null) {
    const id = this.selectedChatId!;
    const version = this.selectionVersion;
    let result = await ChatsApi.getMessages(id, cursor ?? undefined);
    if (
      result instanceof ApiError &&
      cursor?.from_unread &&
      result.code === ERROR_CODES.NETWORK_ERROR
    ) {
      result = await ChatsApi.getMessages(id);
    }
    if (result instanceof ApiError) return result;

    const items = result.data?.items ?? [];
    const firstUnreadId = result.data?.first_unread_id;
    if (firstUnreadId && version === this.selectionVersion)
      this.firstUnreadId.value = firstUnreadId;
    if (firstUnreadId || cursor?.after) {
      return {
        items: [...items].reverse(),
        next: items.length ? { before: items[0].id } : null,
        previous:
          result.data?.has_more && items.length ? { after: items[items.length - 1].id } : null,
      };
    }
    return {
      items,
      next: items.length === MESSAGES_PAGE_SIZE ? { before: items[items.length - 1].id } : null,
      previous: cursor?.before && items.length ? { after: items[0].id } : null,
    };
  }

  private resetMessages(fromUnread = false): void {
    this.pendingMessages = [];
    this.refreshAfterMessageLoad = false;
    this.firstUnreadId.value = undefined;
    this.messagePagination.reset(fromUnread ? { from_unread: true } : null);
  }

  async loadLatestMessages(): Promise<void> {
    const pagination = this.messagePagination.state.value;
    if (!this.selectedChatId || (!pagination.previous && !pagination.pending)) return;
    this.messagesLoading.value = true;
    this.resetMessages();
    await this.loadMessages();
  }

  async loadMessages(id = this.selectedChatId, version = this.selectionVersion): Promise<void> {
    if (!id || this.messagePagination.state.value.pending) return;
    this.messagesLoading.value = true;
    this.messagesError.value = '';

    const result = await this.messagePagination.load('refresh');
    if (version !== this.selectionVersion) return;

    if (result instanceof ApiError) this.messagesError.value = result.message;
    this.messagesLoading.value = false;
    this.finishMessageLoad();
  }

  async loadMoreMessages(direction: PageDirection): Promise<void> {
    if (!this.selectedChatId || this.messagesLoading.value) return;
    const version = this.selectionVersion;
    await this.messagePagination.load(direction);
    if (version === this.selectionVersion) this.finishMessageLoad();
  }

  private finishMessageLoad(): void {
    this.flushMessages();
    this.clearUnreadDivider();
    if (!this.refreshAfterMessageLoad || this.messagePagination.state.value.pending) return;
    this.refreshAfterMessageLoad = false;
    void this.refreshMessages();
  }

  private flushMessages(): void {
    if (this.messagePagination.state.value.pending) return;
    this.messagePagination.prependRecent(
      this.pendingMessages,
      MESSAGES_PAGE_SIZE,
      (message) => ({ before: message.id }),
      (message) => ({ after: message.id }),
    );
    this.pendingMessages = [];
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
    await this.refreshMessages();
  }

  private async refreshMessages(): Promise<void> {
    if (this.destroyed || !this.selectedChatId || this.messagePagination.state.value.previous)
      return;
    if (this.messagesLoading.value || this.messagePagination.state.value.pending) {
      this.refreshAfterMessageLoad = true;
      return;
    }
    if (this.messagesError.value) {
      await this.loadMessages();
      return;
    }

    const version = this.selectionVersion;
    const result = await this.messagePagination.load('refresh');
    if (version !== this.selectionVersion) return;
    if (result instanceof ApiError) debugError(result.message);
    this.finishMessageLoad();
  }

  async sendMessage(content: string): Promise<ChatMessage | null> {
    const id = this.selectedChatId;
    const text = content.trim();

    if (!id || !text || this.sending.value) {
      return null;
    }

    this.stopTyping();
    this.sending.value = true;
    this.sendError.value = '';

    const result = await ChatsApi.sendMessage(id, text);
    this.sending.value = false;
    if (result instanceof ApiError) {
      this.sendError.value = result.message;
      return null;
    }

    if (result.data) {
      this.acceptMessage(result.data);
    }
    return result.data ?? null;
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

  async createDialog(peerId: string): Promise<ApiResult<ChatDetailResponse>> {
    const requestVersion = ++this.dialogRequestVersion;
    const result = await ChatsApi.createDialog(peerId);
    if (result.success && result.data?.chat?.id && requestVersion === this.dialogRequestVersion) {
      await this.loadChats(false);
      if (requestVersion === this.dialogRequestVersion) {
        await this.selectChat(result.data.chat.id);
      }
    }
    return result;
  }

  async addMembers(ids: string[]): Promise<string[]> {
    const id = this.selectedChatId;
    if (!id) return ['Чат не выбран'];
    const errors: string[] = [];
    for (const userId of ids) {
      const result = await ChatsApi.addMember(id, userId);
      if (result instanceof ApiError) errors.push(result.message);
    }
    await Promise.all([this.loadMembers(id), this.loadChats(false)]);
    return errors;
  }

  async updateMemberRole(
    userId: string,
    role: 'admin' | 'member',
  ): Promise<ApiResult<ChatMember> | null> {
    const chatId = this.selectedChatId;
    if (!chatId) return null;

    const result = await ChatsApi.updateMemberRole(chatId, userId, role);
    if (result.success) {
      this.members.value = this.members.value.map((member) =>
        member.user_id === userId ? result.data : member,
      );
      if (userId === user.getId()) this.role.value = role;
    }
    return result;
  }

  async uploadGroupAvatar(file: File): Promise<ApiResult<ChatDetailResponse> | null> {
    const id = this.selectedChatId;
    if (!id) return null;
    const result = await ChatsApi.uploadGroupAvatar(id, file);
    if (result.success) await this.loadChats(false);
    return result;
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
      this.chatPagination.updateItems((chat) => (chat.id === id ? null : chat));
    }

    this.selectedChatId = null;
    this.selectionVersion += 1;
    this.activeChat.value = null;
    this.role.value = null;
    this.resetMessages();
    this.members.value = [];
  }

  markVisibleMessageRead(messageId: string): void {
    const chatId = this.selectedChatId;
    const userId = user.getId();
    const boundary = this.messages.value.find((message) => message.id === messageId);
    if (!chatId || !userId || !boundary || boundary.is_read || boundary.user_id === userId) return;

    if (this.socket.send({ type: 'message.mark_read', chat_id: chatId, message_id: messageId })) {
      this.applyReadBoundary(messageId, false);
    }
  }

  private applyReadBoundary(messageId: string, outgoing: boolean): void {
    const messages = this.messages.value;
    const end = messages.findIndex((message) => message.id === messageId);
    if (end === -1) return;
    const ids = new Set(
      messages
        .slice(0, end + 1)
        .filter((message) => !message.is_read && (message.user_id === user.getId()) === outgoing)
        .map((message) => message.id),
    );
    if (ids.size) {
      this.messagePagination.updateItems((message) =>
        ids.has(message.id) ? { ...message, is_read: true } : message,
      );
    }
    if (!outgoing) this.clearUnreadDivider();
  }

  private clearUnreadDivider(): void {
    const pagination = this.messagePagination.state.value;
    if (!this.firstUnreadId.value || pagination.previous || pagination.pending) return;

    const userId = user.getId();
    if (!this.messages.value.some((message) => !message.is_read && message.user_id !== userId)) {
      this.firstUnreadId.value = undefined;
    }
  }

  private scheduleActivityRefresh(): void {
    if (this.activityTimer !== null) return;
    this.activityTimer = window.setTimeout(() => {
      this.activityTimer = null;
      void this.loadChats(false);
    }, 150);
  }

  private async refreshChatFromEvent(chatId: string): Promise<void> {
    const version = (this.chatEventVersions.get(chatId) ?? 0) + 1;
    this.chatEventVersions.set(chatId, version);
    const result = await ChatsApi.getChat(chatId);
    if (this.destroyed || this.chatEventVersions.get(chatId) !== version) return;
    if (result instanceof ApiError) {
      if (this.selectedChatId === chatId && (result.status === 403 || result.status === 404)) {
        this.removeCurrentChat();
      }
      void this.loadChats(false);
      return;
    }

    const current = this.chats.value.find((chat) => chat.id === chatId);
    const updated = toDisplayChat({ ...current, ...result.data.chat });
    if (current && updated.id) {
      const item = { ...updated, id: updated.id };
      this.chatPagination.updateItems((chat) => (chat.id === chatId ? item : chat));
    } else {
      void this.loadChats(false);
    }
    if (this.selectedChatId === chatId) {
      this.activeChat.value = updated;
      this.role.value = result.data.role;
    }
  }

  private acceptMessage(message: ChatMessage): void {
    const id = message.chat_id;

    if (this.selectedChatId === id) {
      this.removeRemoteTypingUser(message.user_id);
      const pagination = this.messagePagination.state.value;
      if (
        (!pagination.previous || pagination.pending === 'previous') &&
        !this.pendingMessages.some((item) => item.id === message.id)
      ) {
        this.pendingMessages.unshift(message);
        if (this.pendingMessages.length > MESSAGES_PAGE_SIZE) this.pendingMessages.pop();
        if (!this.messagesLoading.value) this.flushMessages();
      }
    }

    this.chatPagination.updateItems((chat) => {
      if (chat.id !== id) {
        return chat;
      }

      return {
        ...toDisplayChat({
          ...chat,
          is_online: chat.isOnline,
          unread_count: chat.unreadCount,
          last_message: {
            id: message.id,
            content: message.content,
            type: message.type,
            created_at: message.created_at,
          },
        }),
        id: chat.id,
        unreadCount:
          chat.unreadCount +
          (message.user_id !== user.getId() && chat.last_message?.id !== message.id ? 1 : 0),
      };
    });
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
        if (payload.chat_id === this.selectedChatId) {
          this.applyReadBoundary(payload.message_id, payload.user_id !== user.getId());
        }
        if (payload.user_id === user.getId()) this.scheduleActivityRefresh();
      }
      return;
    }

    if (event.type === 'chat.deleted') {
      const payload = event.payload as { chat_id?: string } | undefined;
      if (payload?.chat_id) {
        this.chatEventVersions.set(
          payload.chat_id,
          (this.chatEventVersions.get(payload.chat_id) ?? 0) + 1,
        );
      }
      if (payload?.chat_id === this.selectedChatId) this.removeCurrentChat();
      else if (payload?.chat_id)
        this.chatPagination.updateItems((chat) => (chat.id === payload.chat_id ? null : chat));
      void this.loadChats(false);
      return;
    }

    if (event.type === 'chat.created' || event.type === 'chat.updated') {
      const payload = event.payload as { chat_id?: string } | undefined;
      if (payload?.chat_id) void this.refreshChatFromEvent(payload.chat_id);
      return;
    }

    if (event.type === 'chat.activity') {
      const payload = event.payload as { chat_id?: string } | undefined;
      if (payload?.chat_id !== this.selectedChatId) this.scheduleActivityRefresh();
      return;
    }

    if (event.type === 'member.updated') {
      const payload = event.payload as
        { chat_id?: string; user_id?: string; role?: string } | undefined;
      if (
        payload?.chat_id === this.selectedChatId &&
        payload.user_id &&
        (payload.role === 'admin' || payload.role === 'member')
      ) {
        this.members.value = this.members.value.map((member) =>
          member.user_id === payload.user_id
            ? { ...member, role: payload.role as 'admin' | 'member' }
            : member,
        );
        if (payload.user_id === user.getId()) this.role.value = payload.role;
      }
      return;
    }

    if (event.type === 'member.added' || event.type === 'member.deleted') {
      const payload = event.payload as
        { chat_id?: string; user_id?: string; member?: ChatMember } | undefined;
      const chatId = payload?.chat_id;
      const memberId = payload?.member?.user_id ?? payload?.user_id;
      if (!chatId) return;

      if (event.type === 'member.deleted' && memberId === user.getId()) {
        this.chatEventVersions.set(chatId, (this.chatEventVersions.get(chatId) ?? 0) + 1);
        if (chatId === this.selectedChatId) this.removeCurrentChat();
        else this.chatPagination.updateItems((chat) => (chat.id === chatId ? null : chat));
        return;
      }

      if (chatId === this.selectedChatId) {
        if (event.type === 'member.added' && payload?.member) {
          this.members.value = [
            ...this.members.value.filter((member) => member.user_id !== payload.member?.user_id),
            payload.member,
          ];
        } else if (event.type === 'member.deleted' && memberId) {
          this.members.value = this.members.value.filter((member) => member.user_id !== memberId);
        } else {
          void this.loadMembers(chatId);
        }
      }

      void this.refreshChatFromEvent(chatId);
    }
  }
}
