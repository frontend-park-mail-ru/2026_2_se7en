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
  renderGroupEdit,
  renderGroupInfo,
} from '@/components/chat/GroupViews.ts';
import { validateAvatar, validateGroupForm } from '@/components/chat/GroupValidation.ts';
import { ROUTES } from '@/constants/Routes.ts';
import { eventBus } from '@/helpers/EventBus.ts';
import { formatMessageTime, getChatInitials } from '@/helpers/chat.ts';
import { DefaultLayout } from '@/layouts/DefaultLayout.ts';
import { Page } from '@/pages/Page.ts';
import { user } from '@/store/User.ts';
import { ChatsPageModel } from './ChatsPage.model.ts';
import type { ChatsView } from './ChatsPage.types.ts';

/** Преобразует участника из ответа API для отображения. */
function toGroupMemberView(member: ChatMember): GroupMemberView {
  const fullName = [member.profile.first_name, member.profile.last_name].filter(Boolean).join(' ');
  const name = fullName || member.profile.nickname;
  const initials = getChatInitials(name);

  return {
    id: member.user_id,
    name,
    initials,
    status: member.profile.nickname,
    role: member.role,
  };
}

/**
 * Страница чатов и связанных с ней экранов группы.
 */
export class ChatsPage extends Page {
  static route = ROUTES.HOME;

  private readonly model = new ChatsPageModel();
  private readonly layout = new DefaultLayout();
  private readonly chatList = new ChatList();
  private readonly chatArea = new ChatArea();

  private view: ChatsView = 'chat';
  private createMenuOpen = false;
  private dialogMenuOpen = false;
  private deleteConfirmOpen = false;
  private leaveConfirmOpen = false;
  private openMemberMenuId: string | null = null;
  private removeMemberId: string | null = null;
  private chatFilter: ChatFilter = 'all';
  private chatSearch = '';
  private contactSearch = '';
  private memberSearch = '';
  private messageDraft = '';
  private actionPending = false;
  private createForm: GroupFormView = {};
  private editForm: GroupFormView = {};
  private createAvatarFile: File | null = null;
  private editAvatarFile: File | null = null;
  private createAvatarObjectUrl: string | null = null;
  private editAvatarObjectUrl: string | null = null;
  private readonly contacts: ContactPreview[] = [];
  private readonly groupContacts: GroupMemberView[] = [];
  private readonly selectedMemberIds = new Set<string>();
  private readonly selectedAdditionalMemberIds = new Set<string>();

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
        this.model.membersLoading,
        this.model.membersError,
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
    const networkError = this.model.hasNetworkError.value;
    const groupMembers = this.model.members.value.map(toGroupMemberView);
    const typingUsers = this.model.typingUsers.value;
    const typingName =
      groupMembers.find((member) => member.id === typingUsers[0])?.name ?? 'Кто-то';
    const typingLabel =
      typingUsers.length > 1
        ? 'Несколько печатают…'
        : typingUsers.length === 1
          ? chat?.type === 'group'
            ? `${typingName} печатает…`
            : 'Собеседник печатает…'
          : '';
    const role = this.model.role.value;
    const messages: Message[] = this.model.messages.value.map((message) => ({
      id: message.id,
      text: message.content ?? '',
      isOutgoing: message.user_id === user.getId(),
      isRead: message.is_read,
      time: formatMessageTime(new Date(message.created_at)),
    }));
    const chatContent = this.chatArea.render(chat, chats, loading, networkError, {
      messages,
      messagesLoading: this.model.messagesLoading.value,
      messagesError: this.model.messagesError.value,
      sendError: this.model.sendError.value,
      sending: this.model.sending.value,
      hasMoreMessages: this.model.hasMoreMessages.value,
      draft: this.messageDraft,
      typingLabel,
      canEditGroup: role === 'creator' || role === 'admin',
      canDeleteGroup: role === 'creator',
      menuOpen: this.dialogMenuOpen,
      deleteConfirmOpen: this.deleteConfirmOpen,
    });

    if (
      (['group-members', 'group-details', 'group-add-members'] as ChatsView[]).includes(this.view)
    ) {
      const leftPanel =
        this.view === 'group-details'
          ? renderGroupCreateDetails(this.selectedMemberIds, this.groupContacts, this.createForm)
          : renderGroupCreateMembers(
              this.view === 'group-add-members'
                ? this.selectedAdditionalMemberIds
                : this.selectedMemberIds,
              this.groupContacts,
              {
                mode: this.view === 'group-add-members' ? 'add' : 'create',
                query: this.memberSearch,
              },
            );

      return this.layout.render(
        `${leftPanel}${chatContent}`,
        'layout_messenger layout_group-create',
      );
    }

    if (this.view === 'contact-picker') {
      return this.layout.render(
        `${renderContactPicker(this.contacts, { query: this.contactSearch })}${chatContent}`,
        'layout_messenger layout_contact-picker',
      );
    }

    const leftPanel = this.chatList.render(chats, chat, loading, this.createMenuOpen, {
      query: this.chatSearch,
      filter: this.chatFilter,
    });

    if (chat && (['group-info', 'group-edit'] as ChatsView[]).includes(this.view)) {
      const rightPanel =
        this.view === 'group-info'
          ? renderGroupInfo(chat, groupMembers, {
              canManage: role === 'creator' || role === 'admin',
              leaveConfirmOpen: this.leaveConfirmOpen,
              loading: this.model.membersLoading.value,
              error: this.model.membersError.value,
            })
          : renderGroupEdit(chat, groupMembers, this.editForm, {
              openMemberMenuId: this.openMemberMenuId,
              removeMemberId: this.removeMemberId,
              query: this.memberSearch,
              loading: this.model.membersLoading.value,
              error: this.model.membersError.value,
            });

      return this.layout.render(
        `${leftPanel}${rightPanel}`,
        'layout_messenger layout_group-screen',
      );
    }

    const modifier = this.view === 'list' ? 'layout_chat-list' : chat ? 'layout_dialog-open' : '';

    return this.layout.render(`${leftPanel}${chatContent}`, `layout_messenger ${modifier}`.trim());
  }

  private update(): void {
    if (!this.container) {
      return;
    }

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
    if (!target) {
      return;
    }

    const chatItem = target.closest<HTMLElement>('[data-chat-id]');
    if (chatItem?.dataset.chatId) {
      this.view = 'chat';
      this.messageDraft = '';
      this.deleteConfirmOpen = false;
      this.leaveConfirmOpen = false;
      this.openMemberMenuId = null;
      this.createMenuOpen = false;
      this.dialogMenuOpen = false;
      eventBus.emit('chats:select', { id: chatItem.dataset.chatId });
      return;
    }

    if (target.closest('#retry-connection-btn')) {
      eventBus.emit('chats:load');
      return;
    }

    const selectedFilter = target.closest<HTMLElement>('[data-chat-filter]')?.dataset.chatFilter;
    if (
      selectedFilter &&
      (['all', 'unread', 'dialog', 'group'] as string[]).includes(selectedFilter)
    ) {
      this.chatFilter = selectedFilter as ChatFilter;
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

    if (target.closest('[data-group-retry]')) {
      void this.model.loadMembers();
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
      if (this.createAvatarObjectUrl) {
        URL.revokeObjectURL(this.createAvatarObjectUrl);
      }
      this.createAvatarObjectUrl = null;
      this.createAvatarFile = null;
      this.createForm = {};
      this.selectedMemberIds.clear();
      this.view = 'group-members';
      this.update();
      return;
    }

    if (target.closest('[data-group-member]')) {
      const id = target.closest<HTMLElement>('[data-group-member]')?.dataset.groupMember;
      if (!id) {
        return;
      }

      const selection =
        this.view === 'group-add-members'
          ? this.selectedAdditionalMemberIds
          : this.selectedMemberIds;
      if (selection.has(id)) {
        selection.delete(id);
      } else {
        selection.add(id);
      }
      this.update();
      return;
    }

    if (target.closest('[data-group-next]')) {
      this.view = 'group-details';
      this.update();
      return;
    }

    if (target.closest('[data-group-back]')) {
      switch (this.view) {
        case 'group-details':
          this.view = 'group-members';
          break;
        case 'group-edit':
        case 'group-add-members':
          this.view = 'group-info';
          break;
        default:
          this.view = 'chat';
      }
      this.update();
      return;
    }

    if (target.closest('[data-open-group-info]')) {
      this.view = 'group-info';
      this.dialogMenuOpen = false;
      this.update();
      return;
    }

    if (target.closest('[data-open-group-edit]')) {
      const activeChat = this.model.activeChat.value;
      if (this.editAvatarObjectUrl) {
        URL.revokeObjectURL(this.editAvatarObjectUrl);
      }
      this.editAvatarObjectUrl = null;
      this.editAvatarFile = null;
      this.editForm = {
        name: activeChat?.name ?? '',
        description: activeChat?.description ?? '',
      };
      this.view = 'group-edit';
      this.dialogMenuOpen = false;
      this.update();
      return;
    }

    if (target.closest('[data-group-cancel]')) {
      this.view = 'group-info';
      this.update();
      return;
    }

    if (target.closest('[data-group-add]')) {
      this.selectedAdditionalMemberIds.clear();
      this.view = 'group-add-members';
      this.update();
      return;
    }

    const memberMenuId = target.closest<HTMLElement>('[data-member-menu-toggle]')?.dataset
      .memberMenuToggle;
    if (memberMenuId) {
      this.openMemberMenuId = this.openMemberMenuId === memberMenuId ? null : memberMenuId;
      this.update();
      return;
    }

    const removeId = target.closest<HTMLElement>('[data-member-remove]')?.dataset.memberRemove;
    if (removeId) {
      this.removeMemberId = removeId;
      this.openMemberMenuId = null;
      this.update();
      return;
    }

    if (target.closest('[data-member-remove-cancel]')) {
      this.removeMemberId = null;
      this.update();
      return;
    }

    const confirmedMemberId = target.closest<HTMLElement>('[data-member-remove-confirm]')?.dataset
      .memberRemoveConfirm;

    if (confirmedMemberId) {
      if (this.actionPending) {
        return;
      }
      this.actionPending = true;

      void this.model.removeMember(confirmedMemberId).then((result) => {
        this.actionPending = false;
        if (result instanceof ApiError) {
          this.editForm.submitError = result.message;
        } else {
          this.removeMemberId = null;
          this.editForm.submitError = '';
        }
        this.update();
      });
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
      if (this.actionPending) {
        return;
      }
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
      if (this.actionPending) {
        return;
      }
      this.actionPending = true;

      void this.model.deleteChat().then((result) => {
        this.actionPending = false;
        if (result instanceof ApiError) {
          eventBus.emit('snackbar:show', { text: result.message, type: 'error' });
        } else {
          this.deleteConfirmOpen = false;
          this.view = 'chat';
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
      return;
    }

    if (this.createMenuOpen || this.dialogMenuOpen || this.openMemberMenuId) {
      this.createMenuOpen = false;
      this.dialogMenuOpen = false;
      this.openMemberMenuId = null;
      this.update();
    }
  };

  private readonly handleContainerInput = (event: Event): void => {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement | null;
    if (!input) {
      return;
    }

    if (input.matches('[data-message-input]')) {
      this.messageDraft = input.value;
      this.model.updateTyping(input.value);
      const sendButton = this.container?.querySelector<HTMLButtonElement>('.chat-area__send');
      if (sendButton) {
        sendButton.disabled = !input.value.trim();
      }
      return;
    }

    if (input.matches('[data-chat-list-search]')) {
      this.chatSearch = input.value;
      const cursor = input.selectionStart;
      this.update();
      const search = this.container?.querySelector<HTMLInputElement>('[data-chat-list-search]');
      search?.focus();
      if (cursor !== null) {
        search?.setSelectionRange(cursor, cursor);
      }
      return;
    }
    if (input.matches('[data-contact-search]')) {
      this.contactSearch = input.value;
    }
    if (input.matches('[data-member-search]')) {
      this.memberSearch = input.value;
    }

    const form = input.closest<HTMLFormElement>('[data-group-create-form], [data-group-edit-form]');
    if (!form) {
      return;
    }

    const draft = form.matches('[data-group-create-form]') ? this.createForm : this.editForm;
    if (input.name === 'group-name') {
      draft.name = input.value;
    }
    if (input.name === 'group-description') {
      draft.description = input.value;
    }
  };

  private readonly handleContainerChange = (event: Event): void => {
    const input = event.target as HTMLInputElement | null;
    if (!input?.matches('[data-group-avatar]')) {
      return;
    }
    const file = input.files?.[0] ?? null;
    const avatarError = validateAvatar(file);
    const mode = input.dataset.groupAvatar;
    if (mode === 'create') {
      if (this.createAvatarObjectUrl) {
        URL.revokeObjectURL(this.createAvatarObjectUrl);
      }
      this.createAvatarFile = file;
      this.createAvatarObjectUrl = file ? URL.createObjectURL(file) : null;
      this.createForm.avatarUrl = this.createAvatarObjectUrl ?? undefined;
      this.createForm.avatarFileName = this.createAvatarFile?.name;
      this.createForm.avatarError = avatarError;
    } else {
      if (this.editAvatarObjectUrl) {
        URL.revokeObjectURL(this.editAvatarObjectUrl);
      }
      this.editAvatarFile = file;
      this.editAvatarObjectUrl = file ? URL.createObjectURL(file) : null;
      this.editForm.avatarUrl = this.editAvatarObjectUrl ?? undefined;
      this.editForm.avatarFileName = this.editAvatarFile?.name;
      this.editForm.avatarError = avatarError;
    }
    this.update();
  };

  private readonly handleContainerSubmit = (event: SubmitEvent): void => {
    const form = event.target as HTMLFormElement | null;
    if (!form) {
      return;
    }

    if (form.matches('[data-message-form]')) {
      event.preventDefault();

      const text = this.messageDraft.trim();
      if (!text || this.model.sending.value) {
        return;
      }

      void this.model.sendMessage(text).then((sent) => {
        if (sent) {
          this.messageDraft = '';
          this.update();
        }
      });
      return;
    }

    if (form.matches('[data-group-create-form]')) {
      event.preventDefault();
      if (this.createForm.submitting) {
        return;
      }

      const valid = validateGroupForm(
        this.createForm,
        this.selectedMemberIds.size + 1,
        this.createAvatarFile,
      );

      if (!valid) {
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

          if (result instanceof ApiError) {
            this.createForm.submitError = result.message;
          } else {
            this.view = 'chat';
            this.selectedMemberIds.clear();
            this.createForm = {};
          }

          this.update();
        });
      return;
    }

    if (form.matches('[data-group-edit-form]')) {
      event.preventDefault();
      if (this.editForm.submitting) {
        return;
      }

      const valid = validateGroupForm(
        this.editForm,
        this.model.members.value.length,
        this.editAvatarFile,
      );

      if (!valid) {
        this.update();
        return;
      }

      this.editForm.submitting = true;
      this.editForm.submitError = '';
      this.update();

      void this.model
        .updateGroup(this.editForm.name!.trim(), (this.editForm.description ?? '').trim())
        .then((result) => {
          this.editForm.submitting = false;

          if (result instanceof ApiError) {
            this.editForm.submitError = result.message;
          } else {
            this.view = 'group-info';
            this.editForm = {};
          }

          this.update();
        });
    }
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
    if (this.createAvatarObjectUrl) {
      URL.revokeObjectURL(this.createAvatarObjectUrl);
    }
    if (this.editAvatarObjectUrl) {
      URL.revokeObjectURL(this.editAvatarObjectUrl);
    }
    this.layout.unmount();
    this.model.destroy();
    super.unmount();
  }
}
