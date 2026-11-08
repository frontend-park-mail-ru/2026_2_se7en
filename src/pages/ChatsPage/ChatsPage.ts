import './ChatsPage.scss';
import { ApiError } from '@/api/ApiResponse.ts';
import type { Message } from '@/api/chats/chats.types.ts';
import { ChatArea } from '@/components/chat/ChatArea.ts';
import { type ChatFilter, ChatList } from '@/components/chat/ChatList.ts';
import { ROUTES } from '@/constants/Routes.ts';
import { eventBus } from '@/helpers/EventBus.ts';
import { formatMessageTime } from '@/helpers/chat.ts';
import { DefaultLayout } from '@/layouts/DefaultLayout.ts';
import { Page } from '@/pages/Page.ts';
import { user } from '@/store/User.ts';
import { ChatsPageModel } from './ChatsPage.model.ts';

export class ChatsPage extends Page {
  static route = ROUTES.HOME;

  private readonly model = new ChatsPageModel();
  private readonly layout = new DefaultLayout();
  private readonly chatList = new ChatList();
  private readonly chatArea = new ChatArea();
  private view: 'chat' | 'list' = 'chat';
  private createMenuOpen = false;
  private dialogMenuOpen = false;
  private deleteConfirmOpen = false;
  private chatFilter: ChatFilter = 'all';
  private chatSearch = '';
  private messageDraft = '';
  private actionPending = false;

  constructor() {
    super();
    this.setSubscribers(
      [
        this.model.chats,
        this.model.activeChat,
        this.model.role,
        this.model.messages,
        this.model.members,
        this.model.typingUsers,
        this.model.isLoading,
        this.model.hasNetworkError,
        this.model.messagesLoading,
        this.model.messagesError,
        this.model.sendError,
        this.model.sending,
        this.model.hasMoreMessages,
      ],
      () => this.update(),
    );
  }

  render(): string {
    const chat = this.model.activeChat.value;
    const chats = this.model.chats.value;
    const loading = this.model.isLoading.value;
    const typingUsers = this.model.typingUsers.value;
    const typingMember = this.model.members.value.find(
      (member) => member.user_id === typingUsers[0],
    );
    const typingName = typingMember
      ? [typingMember.profile.first_name, typingMember.profile.last_name]
          .filter(Boolean)
          .join(' ') || typingMember.profile.nickname
      : 'Кто-то';
    const typingLabel =
      typingUsers.length > 1
        ? 'Несколько печатают…'
        : typingUsers.length === 1
          ? chat?.type === 'group'
            ? `${typingName} печатает…`
            : 'Собеседник печатает…'
          : '';
    const messages: Message[] = this.model.messages.value.map((message) => ({
      id: message.id,
      text: message.content ?? '',
      isOutgoing: message.user_id === user.getId(),
      isRead: message.is_read,
      time: formatMessageTime(new Date(message.created_at)),
    }));
    const leftPanel = this.chatList.render(chats, chat, loading, this.createMenuOpen, {
      query: this.chatSearch,
      filter: this.chatFilter,
    });
    const rightPanel = this.chatArea.render(
      chat,
      chats,
      loading,
      this.model.hasNetworkError.value,
      {
        messages,
        messagesLoading: this.model.messagesLoading.value,
        messagesError: this.model.messagesError.value,
        sendError: this.model.sendError.value,
        sending: this.model.sending.value,
        hasMoreMessages: this.model.hasMoreMessages.value,
        draft: this.messageDraft,
        typingLabel,
        canDeleteGroup: this.model.role.value === 'creator',
        menuOpen: this.dialogMenuOpen,
        deleteConfirmOpen: this.deleteConfirmOpen,
      },
    );
    const modifier = this.view === 'list' ? 'layout_chat-list' : chat ? 'layout_dialog-open' : '';
    return this.layout.render(`${leftPanel}${rightPanel}`, `layout_messenger ${modifier}`.trim());
  }

  private update(): void {
    if (!this.container) return;
    const focusedInput = document.activeElement?.matches('[data-message-input]')
      ? (document.activeElement as HTMLInputElement)
      : null;
    const selectionStart = focusedInput?.selectionStart;
    const selectionEnd = focusedInput?.selectionEnd;
    this.container.innerHTML = this.render();
    this.bindEvents();
    if (focusedInput) {
      const nextInput = this.container.querySelector<HTMLInputElement>('[data-message-input]');
      nextInput?.focus();
      if (
        selectionStart !== null &&
        selectionStart !== undefined &&
        selectionEnd !== null &&
        selectionEnd !== undefined
      ) {
        nextInput?.setSelectionRange(selectionStart, selectionEnd);
      }
    }
  }

  bindEvents(): void {
    this.layout.bindEvents();
  }

  private readonly handleContainerClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const chatId = target.closest<HTMLElement>('[data-chat-id]')?.dataset.chatId;
    if (chatId) {
      this.view = 'chat';
      this.messageDraft = '';
      this.dialogMenuOpen = false;
      this.createMenuOpen = false;
      eventBus.emit('chats:select', { id: chatId });
      return;
    }
    if (target.closest('#retry-connection-btn')) {
      eventBus.emit('chats:load');
      return;
    }
    const filter = target.closest<HTMLElement>('[data-chat-filter]')?.dataset.chatFilter;
    if (filter === 'all' || filter === 'unread' || filter === 'dialog' || filter === 'group') {
      this.chatFilter = filter;
      this.update();
      return;
    }
    if (target.closest('[data-messages-retry]')) {
      void this.model.loadMessages();
      return;
    }
    if (target.closest('[data-messages-more]')) {
      void this.model.loadOlderMessages();
      return;
    }
    if (target.closest('#new-chat-button')) {
      this.createMenuOpen = !this.createMenuOpen;
      this.update();
      return;
    }
    if (target.closest('[data-confirm-delete]')) {
      if (this.actionPending) return;
      this.actionPending = true;
      void this.model.deleteChat().then((result) => {
        this.actionPending = false;
        if (result instanceof ApiError) {
          eventBus.emit('snackbar:show', { text: result.message, type: 'error' });
        } else {
          this.deleteConfirmOpen = false;
        }
        this.update();
      });
      return;
    }
    if (target.closest('[data-chat-back]')) {
      this.model.stopTyping();
      this.view = 'list';
      this.update();
      return;
    }
    if (target.closest('[data-dialog-menu-toggle]')) {
      this.dialogMenuOpen = !this.dialogMenuOpen;
      this.update();
      return;
    }
    if (target.closest('[data-dialog-delete]')) {
      this.dialogMenuOpen = false;
      this.deleteConfirmOpen = true;
      this.update();
      return;
    }
    if (target.closest('[data-cancel-delete]')) {
      this.deleteConfirmOpen = false;
      this.update();
    }
  };

  private readonly handleContainerInput = (event: Event): void => {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;
    if (input.matches('[data-message-input]')) {
      this.messageDraft = input.value;
      this.model.updateTyping(input.value);
      const sendButton = this.container?.querySelector<HTMLButtonElement>('.chat-area__send');
      if (sendButton) sendButton.disabled = !input.value.trim();
      return;
    }
    if (!input.matches('[data-chat-list-search]')) return;
    this.chatSearch = input.value;
    const cursor = input.selectionStart;
    this.update();
    const search = this.container?.querySelector<HTMLInputElement>('[data-chat-list-search]');
    search?.focus();
    if (cursor !== null) search?.setSelectionRange(cursor, cursor);
  };

  private readonly handleContainerSubmit = (event: SubmitEvent): void => {
    const form = event.target as HTMLFormElement | null;
    if (!form?.matches('[data-message-form]')) return;
    event.preventDefault();
    const text = this.messageDraft.trim();
    if (!text || this.model.sending.value) return;
    void this.model.sendMessage(text).then((sent) => {
      if (sent) {
        this.messageDraft = '';
        this.update();
      }
    });
  };

  async afterMount(): Promise<void> {
    this.container?.addEventListener('click', this.handleContainerClick);
    this.container?.addEventListener('input', this.handleContainerInput);
    this.container?.addEventListener('submit', this.handleContainerSubmit);
    this.model.start();
  }

  unmount(): void {
    this.container?.removeEventListener('click', this.handleContainerClick);
    this.container?.removeEventListener('input', this.handleContainerInput);
    this.container?.removeEventListener('submit', this.handleContainerSubmit);
    this.layout.unmount();
    this.model.destroy();
    super.unmount();
  }
}
