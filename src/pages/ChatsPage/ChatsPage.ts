import './ChatsPage.scss';
import { ApiError } from '@/api/ApiResponse.ts';
import type { ChatMember, Message } from '@/api/chats/chats.types.ts';
import { ChatArea } from '@/components/chat/ChatArea.ts';
import { type ChatFilter, ChatList } from '@/components/chat/ChatList.ts';
import { renderContactPicker } from '@/components/chat/ContactPicker.ts';
import type {
  ContactPreview,
  GroupFormView,
  GroupMemberView,
} from '@/components/chat/chat.types.ts';
import {
  renderGroupCreateDetails,
  renderGroupCreateMembers,
  renderGroupInfo,
} from '@/components/chat/GroupViews.ts';
import { validateAvatar, validateGroupForm } from '@/components/chat/GroupValidation.ts';
import { ROUTES } from '@/constants/Routes.ts';
import { eventBus } from '@/helpers/EventBus.ts';
import { formatMessageTime } from '@/helpers/chat.ts';
import { DefaultLayout } from '@/layouts/DefaultLayout.ts';
import { Page } from '@/pages/Page.ts';
import { user } from '@/store/User.ts';
import { ChatsPageModel } from './ChatsPage.model.ts';

function toGroupMemberView(member: ChatMember): GroupMemberView {
  const name =
    [member.profile.first_name, member.profile.last_name].filter(Boolean).join(' ') ||
    member.profile.nickname;
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
  return {
    id: member.user_id,
    name,
    initials,
    status: member.profile.nickname,
    role: member.role,
  };
}

export class ChatsPage extends Page {
  static route = ROUTES.HOME;

  private readonly model = new ChatsPageModel();
  private readonly layout = new DefaultLayout();
  private readonly chatList = new ChatList();
  private readonly chatArea = new ChatArea();
  private view:
    'chat' | 'list' | 'contact-picker' | 'group-members' | 'group-details' | 'group-info' = 'chat';
  private createMenuOpen = false;
  private dialogMenuOpen = false;
  private deleteConfirmOpen = false;
  private leaveConfirmOpen = false;
  private chatFilter: ChatFilter = 'all';
  private chatSearch = '';
  private contactSearch = '';
  private memberSearch = '';
  private messageDraft = '';
  private actionPending = false;
  private createForm: GroupFormView = {};
  private createAvatarFile: File | null = null;
  private createAvatarObjectUrl: string | null = null;
  private readonly contacts: ContactPreview[] = [];
  private readonly groupContacts: GroupMemberView[] = [];
  private readonly selectedMemberIds = new Set<string>();

  constructor() {
    super();
    this.setSubscribers(
      [
        this.model.chats,
        this.model.activeChat,
        this.model.role,
        this.model.messages,
        this.model.members,
        this.model.membersLoading,
        this.model.membersError,
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
    const chatList = this.chatList.render(chats, chat, loading, this.createMenuOpen, {
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
    if (this.view === 'group-members' || this.view === 'group-details') {
      const groupPanel =
        this.view === 'group-details'
          ? renderGroupCreateDetails(this.selectedMemberIds, this.groupContacts, this.createForm)
          : renderGroupCreateMembers(this.selectedMemberIds, this.groupContacts, {
              mode: 'create',
              query: this.memberSearch,
            });
      return this.layout.render(
        `${groupPanel}${rightPanel}`,
        'layout_messenger layout_group-create',
      );
    }
    if (this.view === 'contact-picker') {
      return this.layout.render(
        `${renderContactPicker(this.contacts, { query: this.contactSearch })}${rightPanel}`,
        'layout_messenger layout_contact-picker',
      );
    }
    if (chat && this.view === 'group-info') {
      const members = this.model.members.value.map(toGroupMemberView);
      const groupInfo = renderGroupInfo(chat, members, {
        canManage: false,
        leaveConfirmOpen: this.leaveConfirmOpen,
        loading: this.model.membersLoading.value,
        error: this.model.membersError.value,
      });
      return this.layout.render(`${chatList}${groupInfo}`, 'layout_messenger layout_group-screen');
    }
    const modifier = this.view === 'list' ? 'layout_chat-list' : chat ? 'layout_dialog-open' : '';
    return this.layout.render(`${chatList}${rightPanel}`, `layout_messenger ${modifier}`.trim());
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
      if (selectionStart != null && selectionEnd != null) {
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
    if (target.closest('[data-create-dialog]')) {
      this.createMenuOpen = false;
      this.contactSearch = '';
      this.view = 'contact-picker';
      this.update();
      return;
    }
    if (target.closest('[data-contact-back]')) {
      this.view = 'chat';
      this.update();
      return;
    }
    if (target.closest('[data-create-group]')) {
      this.createMenuOpen = false;
      this.memberSearch = '';
      if (this.createAvatarObjectUrl) URL.revokeObjectURL(this.createAvatarObjectUrl);
      this.createAvatarObjectUrl = null;
      this.createAvatarFile = null;
      this.createForm = {};
      this.selectedMemberIds.clear();
      this.view = 'group-members';
      this.update();
      return;
    }
    const memberId = target.closest<HTMLElement>('[data-group-member]')?.dataset.groupMember;
    if (memberId) {
      if (this.selectedMemberIds.has(memberId)) this.selectedMemberIds.delete(memberId);
      else this.selectedMemberIds.add(memberId);
      this.update();
      return;
    }
    if (target.closest('[data-group-next]')) {
      this.view = 'group-details';
      this.update();
      return;
    }
    if (target.closest('[data-group-back]')) {
      this.view = this.view === 'group-details' ? 'group-members' : 'chat';
      this.update();
      return;
    }
    if (target.closest('[data-open-group-info]')) {
      this.view = 'group-info';
      this.dialogMenuOpen = false;
      this.update();
      return;
    }
    if (target.closest('[data-group-retry]')) {
      void this.model.loadMembers();
      return;
    }
    if (target.closest('[data-group-leave]')) {
      this.view = 'group-info';
      this.leaveConfirmOpen = true;
      this.update();
      return;
    }
    if (target.closest('[data-group-leave-cancel]')) {
      this.leaveConfirmOpen = false;
      this.update();
      return;
    }
    if (target.closest('[data-group-leave-confirm]')) {
      if (this.actionPending) return;
      this.actionPending = true;
      void this.model.leaveGroup().then((result) => {
        this.actionPending = false;
        if (result instanceof ApiError) {
          eventBus.emit('snackbar:show', { text: result.message, type: 'error' });
        } else {
          this.leaveConfirmOpen = false;
          this.view = 'chat';
        }
        this.update();
      });
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
    if (input.matches('[data-chat-list-search]')) {
      this.chatSearch = input.value;
      const cursor = input.selectionStart;
      this.update();
      const search = this.container?.querySelector<HTMLInputElement>('[data-chat-list-search]');
      search?.focus();
      if (cursor !== null) search?.setSelectionRange(cursor, cursor);
      return;
    }
    if (input.matches('[data-contact-search]')) this.contactSearch = input.value;
    if (input.matches('[data-member-search]')) this.memberSearch = input.value;
    if (!input.closest('[data-group-create-form]')) return;
    if (input.name === 'group-name') this.createForm.name = input.value;
    if (input.name === 'group-description') this.createForm.description = input.value;
  };

  private readonly handleContainerChange = (event: Event): void => {
    const input = event.target as HTMLInputElement | null;
    if (!input?.matches('[data-group-avatar]')) return;
    const file = input.files?.[0] ?? null;
    if (this.createAvatarObjectUrl) URL.revokeObjectURL(this.createAvatarObjectUrl);
    this.createAvatarFile = file;
    this.createAvatarObjectUrl = file ? URL.createObjectURL(file) : null;
    this.createForm.avatarUrl = this.createAvatarObjectUrl ?? undefined;
    this.createForm.avatarFileName = file?.name;
    this.createForm.avatarError = validateAvatar(file);
    this.update();
  };

  private readonly handleContainerSubmit = (event: SubmitEvent): void => {
    const form = event.target as HTMLFormElement | null;
    if (!form) return;
    if (form.matches('[data-group-create-form]')) {
      event.preventDefault();
      if (this.createForm.submitting) return;
      if (
        !validateGroupForm(this.createForm, this.selectedMemberIds.size + 1, this.createAvatarFile)
      ) {
        this.update();
        return;
      }
      this.createForm.submitting = true;
      this.createForm.submitError = '';
      this.update();
      void this.model
        .createGroup(this.createForm.name!.trim(), (this.createForm.description ?? '').trim(), [
          ...this.selectedMemberIds,
        ])
        .then((result) => {
          this.createForm.submitting = false;
          if (result instanceof ApiError) this.createForm.submitError = result.message;
          else {
            this.view = 'chat';
            this.selectedMemberIds.clear();
            this.createForm = {};
          }
          this.update();
        });
      return;
    }
    if (!form.matches('[data-message-form]')) return;
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
    this.container?.addEventListener('change', this.handleContainerChange);
    this.container?.addEventListener('submit', this.handleContainerSubmit);
    this.model.start();
  }

  unmount(): void {
    this.container?.removeEventListener('click', this.handleContainerClick);
    this.container?.removeEventListener('input', this.handleContainerInput);
    this.container?.removeEventListener('change', this.handleContainerChange);
    this.container?.removeEventListener('submit', this.handleContainerSubmit);
    if (this.createAvatarObjectUrl) URL.revokeObjectURL(this.createAvatarObjectUrl);
    this.layout.unmount();
    this.model.destroy();
    super.unmount();
  }
}
