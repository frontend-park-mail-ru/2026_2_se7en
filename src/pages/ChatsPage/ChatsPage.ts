import './ChatsPage.scss';
import { ApiError } from '@/api/ApiResponse.ts';
import { ChatArea } from '@/components/chat/ChatArea.ts';
import { ChatsPageModel } from './ChatsPage.model.ts';
import type { ChatsView } from './ChatsPage.types.ts';
import type { Contact } from '@/api/contacts/contacts.types.ts';
import { ContactsApi } from '@/api/contacts/ContactsApi.ts';
import { DefaultLayout } from '@/layouts/DefaultLayout.ts';
import { Page } from '@/pages/Page.ts';
import { PagedScroll } from '@/helpers/PagedScroll.ts';
import { PublicProfileModal } from '@/components/profile/PublicProfileModal.ts';
import type { PublicProfileView } from '@/components/profile/PublicProfileModal.ts';
import { ROUTES } from '@/constants/Routes.ts';
import { SidebarSearchModel } from './SidebarSearch.model.ts';
import { eventBus } from '@/helpers/EventBus.ts';
import { renderContactPicker } from '@/components/chat/ContactPicker.ts';
import { user } from '@/store/User.ts';
import { type ChatFilter, ChatList } from '@/components/chat/ChatList.ts';
import type { ChatMember, ChatMessage, Message } from '@/api/chats/chats.types.ts';
import type {
  ContactPreview,
  GroupFormView,
  GroupMemberView,
} from '@/components/chat/chat.types.ts';
import { SEARCH_SECTIONS, type SearchSection } from '@/components/chat/SidebarSearch.ts';
import { formatMessageTime, getChatInitials } from '@/helpers/chat.ts';
import {
  groupSelectionCountText,
  renderGroupCreateDetails,
  renderGroupCreateMembers,
  renderGroupEdit,
  renderGroupInfo,
  updateMemberRowState,
} from '@/components/chat/GroupViews.ts';
import { validateAvatar, validateGroupForm } from '@/components/chat/GroupValidation.ts';

/** Преобразует участника из ответа API для отображения. */
function toGroupMemberView(member: ChatMember): GroupMemberView {
  const fullName = [member.profile.first_name, member.profile.last_name].filter(Boolean).join(' ');
  const name = fullName || member.profile.nickname;
  const initials = getChatInitials(name);

  return {
    id: member.user_id,
    name,
    initials,
    status: member.is_online ? 'в сети' : member.profile.nickname,
    avatarUrl: member.profile.icon_url ?? undefined,
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
  private readonly chatScroll = new PagedScroll('[data-chat-list]', (direction) => {
    void this.model.loadMoreChats(direction);
  });
  private readonly chatArea = new ChatArea();
  private readonly messageScroll = new PagedScroll(
    '[data-message-history]',
    (direction) => {
      if (!this.openingMessage) void this.model.loadMoreMessages(direction);
    },
    true,
  );

  private view: ChatsView = 'chat';
  private createMenuOpen = false;
  private dialogMenuOpen = false;
  private deleteConfirmOpen = false;
  private deleteError = '';
  private leaveConfirmOpen = false;
  private openMemberMenuId: string | null = null;
  private removeMemberId: string | null = null;
  private chatFilter: ChatFilter = 'all';
  private searchQuery = '';
  private sidebarSearch: SidebarSearchModel | null = null;
  private searchTimer?: number;
  private chatNavigationVersion = 0;
  private openingMessage = false;
  private messageSearchTimer?: number;
  private messageSearchVersion = 0;
  private messageSearch: {
    chatId: string;
    query: string;
    currentId?: string;
    scrollTop: number;
    items: ChatMessage[];
    before?: string;
    loading: boolean;
    error: boolean;
  } | null = null;
  private messageDraft = '';
  private actionPending = false;
  private createForm: GroupFormView = {};
  private editForm: GroupFormView = {};
  private createAvatarFile: File | null = null;
  private editAvatarFile: File | null = null;
  private createAvatarObjectUrl: string | null = null;
  private editAvatarObjectUrl: string | null = null;
  private contacts: ContactPreview[] = [];
  private groupContacts: GroupMemberView[] = [];
  private contactsLoading = false;
  private contactsError = '';
  private contactRequestVersion = 0;
  private publicProfile: PublicProfileView | null = null;
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
        this.model.messagePagination.state,
        this.model.chatPagination.state,
      ],
      () => this.update(),
    );
  }

  render(): string {
    const chat = this.model.activeChat.value;
    if (this.messageSearch && this.messageSearch.chatId !== chat?.id) this.messageSearch = null;
    const chats = this.model.chats.value;
    const loading = this.model.isLoading.value;
    const networkError = this.model.hasNetworkError.value;
    const groupMembers = this.model.members.value.map(toGroupMemberView);
    const currentUserId = user.getId();
    const peerUserId =
      chat?.type === 'dialog'
        ? this.model.members.value.find((member) => member.user_id !== currentUserId)?.user_id
        : undefined;
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
    const searchingMessages = Boolean(this.messageSearch?.query.trim());
    const messageItems = searchingMessages
      ? (this.messageSearch?.items ?? [])
      : this.model.messages.value;
    const messages: Message[] = messageItems.map((message) => ({
      id: message.id,
      text: message.content ?? '',
      isOutgoing: message.user_id === user.getId(),
      isRead: message.is_read,
      time: formatMessageTime(new Date(message.created_at)),
    }));
    const chatContent = this.chatArea.render(chat, chats, loading, networkError, {
      messages,
      searchQuery: this.messageSearch?.query,
      searchMessageId: this.messageSearch?.currentId,
      messagesLoading: searchingMessages
        ? this.messageSearch?.loading && !messages.length
        : this.model.messagesLoading.value,
      messagesError: searchingMessages
        ? this.messageSearch?.error
          ? 'Не удалось найти сообщения'
          : ''
        : this.model.messagesError.value,
      sendError: this.model.sendError.value,
      sending: this.model.sending.value,
      messagePagination: searchingMessages ? undefined : this.model.messagePagination.state.value,
      moreSearchResults: Boolean(
        searchingMessages && this.messageSearch?.before && !this.messageSearch.loading,
      ),
      draft: this.messageDraft,
      typingLabel,
      peerUserId,
      canEditGroup: role === 'creator' || role === 'admin',
      canDeleteGroup: role === 'creator',
      menuOpen: this.dialogMenuOpen,
      deleteConfirmOpen: this.deleteConfirmOpen,
      deleteError: this.deleteError,
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
                loading: this.contactsLoading,
                error: this.contactsError,
                membersError: this.createForm.membersError,
              },
            );

      return this.renderLayout(
        `${leftPanel}${chatContent}`,
        'layout_messenger layout_group-create',
      );
    }

    if (this.view === 'contact-picker') {
      return this.renderLayout(
        `${renderContactPicker(this.contacts, { loading: this.contactsLoading, error: this.contactsError })}${chatContent}`,
        'layout_messenger layout_contact-picker',
      );
    }

    const leftPanel = this.chatList.render(chats, chat, loading, this.createMenuOpen, {
      filter: this.chatFilter,
      pagination: this.model.chatPagination.state.value,
      query: this.searchQuery,
      results: this.sidebarSearch?.results,
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
              canManageRoles: role === 'creator',
              canDeleteGroup: role === 'creator',
              loading: this.model.membersLoading.value,
              error: this.model.membersError.value,
            });

      const confirmation =
        this.view === 'group-edit' && this.deleteConfirmOpen
          ? this.chatArea.renderDeleteConfirm(chat.name ?? '', true, this.deleteError)
          : '';
      return this.renderLayout(
        `${leftPanel}${rightPanel}${confirmation}`,
        'layout_messenger layout_group-screen',
      );
    }

    const modifier = this.view === 'list' ? 'layout_chat-list' : chat ? 'layout_dialog-open' : '';

    return this.renderLayout(`${leftPanel}${chatContent}`, `layout_messenger ${modifier}`.trim());
  }

  private renderLayout(content: string, modifier = ''): string {
    return this.layout.render(`${content}${PublicProfileModal(this.publicProfile)}`, modifier);
  }

  private openPublicProfile(userId: string, contact?: Contact): void {
    const member = this.model.members.value.find((candidate) => candidate.user_id === userId);
    const profile = contact ?? member?.profile;
    if (!profile) {
      return;
    }
    const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
    this.publicProfile = {
      userId,
      firstName: profile.first_name,
      lastName: profile.last_name,
      nickname: profile.nickname,
      avatarUrl: profile.icon_url,
      initials: getChatInitials(fullName || profile.nickname),
      isContact: Boolean(contact) || this.contacts.some((item) => item.id === userId),
    };
    this.dialogMenuOpen = false;
    this.update();
    this.container?.querySelector<HTMLButtonElement>('[data-public-profile-close]')?.focus();
  }

  private async addPublicProfileToContacts(profile = this.publicProfile): Promise<void> {
    if (!profile || profile.isContact || profile.isAddingContact) return;

    profile.isAddingContact = true;
    this.update();
    const result = await ContactsApi.createContact({ nickname: profile.nickname });
    profile.isAddingContact = false;
    if (result.success || result.status === 409) {
      profile.isContact = true;
      const visibleProfile = this.sidebarSearch?.results.users.items.find(
        (item) => item.id === profile.userId,
      )?.profile;
      if (visibleProfile) visibleProfile.isContact = true;
      if (this.publicProfile?.userId === profile.userId) this.publicProfile.isContact = true;
    }
    this.update();

    if (result.success) {
      if (!this.contacts.some((contact) => contact.id === profile.userId)) {
        this.contacts.push({
          id: profile.userId,
          name: [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.nickname,
          nickname: profile.nickname,
          initials: profile.initials,
          avatarUrl: profile.avatarUrl ?? undefined,
          online: false,
        });
      }
      eventBus.emit('snackbar:show', { text: 'Контакт добавлен', type: 'success' });
    } else if (result.status === 409) {
      eventBus.emit('snackbar:show', { text: 'Пользователь уже в контактах', type: 'info' });
    } else if (result instanceof ApiError) {
      eventBus.emit('snackbar:show', { text: result.message, type: 'error' });
    }
  }

  private closePublicProfile(): void {
    this.publicProfile = null;
    this.update();
  }

  private update(): void {
    if (!this.container) {
      return;
    }

    const focusedInput =
      document.activeElement instanceof HTMLInputElement ? document.activeElement : null;
    const inputSelector = focusedInput?.matches(
      '[data-message-input], [name="message-search"], [name="sidebar-search"]',
    )
      ? `input[name="${focusedInput.name}"]`
      : null;
    const selectionStart = focusedInput?.selectionStart;
    const selectionEnd = focusedInput?.selectionEnd;
    const searchButton = document.activeElement?.closest<HTMLButtonElement>('[data-search-step]');
    const focusedMessageId =
      document.activeElement?.closest<HTMLElement>('[data-message-id]')?.dataset.messageId;
    const previousHistory = this.container.querySelector<HTMLElement>('[data-message-history]');
    const historyScroll = previousHistory?.scrollTop;
    const historyKey = previousHistory?.dataset.scrollKey;
    this.chatScroll.capture(this.container);
    this.messageScroll.capture(this.container);
    this.replaceContent(this.render());
    this.bindEvents();

    if (inputSelector) {
      const nextInput = this.container.querySelector<HTMLInputElement>(inputSelector);
      nextInput?.focus({ preventScroll: true });

      if (selectionStart != null && selectionEnd != null) {
        nextInput?.setSelectionRange(selectionStart, selectionEnd);
      }
    } else if (searchButton) {
      this.container
        .querySelector<HTMLButtonElement>(`[data-search-step="${searchButton.dataset.searchStep}"]`)
        ?.focus({ preventScroll: true });
    }
    this.chatScroll.connect(this.container);
    this.messageScroll.connect(this.container);

    const history = this.container.querySelector<HTMLElement>('[data-message-history]');
    if (history && historyKey === history.dataset.scrollKey) {
      if (this.messageSearch?.query.trim() && historyScroll !== undefined) {
        history.scrollTop = historyScroll;
      }
      if (focusedMessageId) {
        history
          .querySelector<HTMLElement>(`[data-message-id="${CSS.escape(focusedMessageId)}"]`)
          ?.focus({ preventScroll: true });
      }
    }

    if (this.messageSearch) {
      const current = history?.querySelector<HTMLElement>('[aria-current="true"]');

      if (current) {
        this.messageSearch.currentId = current.dataset.messageId;
      }
    }
  }

  private async loadMessageSearch(): Promise<void> {
    const search = this.messageSearch;
    if (!search?.query.trim()) {
      return;
    }

    const version = ++this.messageSearchVersion;
    search.loading = true;
    search.error = false;
    this.update();
    const result = await this.model.searchMessages(
      search.chatId,
      search.query.trim(),
      search.before,
    );

    if (this.messageSearch !== search || version !== this.messageSearchVersion) {
      return;
    }

    search.loading = false;
    if (result instanceof ApiError) {
      search.error = true;
    } else {
      const page = result.data?.items ?? [];
      search.before = page.length === 50 ? page[page.length - 1]?.id : undefined;
      search.items = [...page.reverse(), ...search.items];
    }
    this.update();
  }

  private closeMessageSearch(): void {
    window.clearTimeout(this.messageSearchTimer);
    const scrollTop = this.messageSearch?.scrollTop ?? 0;
    this.messageSearch = null;
    this.update();
    const history = this.container?.querySelector<HTMLElement>('[data-message-history]');

    if (history) {
      history.scrollTop = scrollTop;
    }

    this.container?.querySelector<HTMLButtonElement>('[data-chat-search]')?.focus();
  }

  private moveSearchResult(step: number): void {
    if (!this.messageSearch || !this.container) {
      return;
    }

    const rows = Array.from(
      this.container.querySelectorAll<HTMLElement>('[data-message-history] [data-message-id]'),
    );

    if (!rows.length) {
      return;
    }

    const index = rows.findIndex((row) => row.dataset.messageId === this.messageSearch?.currentId);
    this.messageSearch.currentId =
      rows[(index + step + rows.length) % rows.length].dataset.messageId;
    this.update();
    this.container
      .querySelector('[data-message-id][aria-current="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }

  private async loadSidebarSearch(
    search: SidebarSearchModel,
    section: SearchSection,
  ): Promise<void> {
    const request = search.load(section);
    this.update();
    await request;
    if (this.sidebarSearch === search) {
      this.update();
    }
  }

  private async startDialog(userId: string): Promise<void> {
    if (this.actionPending) return;
    this.actionPending = true;
    const fromContactPicker = this.view === 'contact-picker';
    const result = await this.model.createDialog(userId);
    this.actionPending = false;
    if (!this.container) return;

    if (result instanceof ApiError) {
      if (fromContactPicker) this.contactsError = result.message;
      else eventBus.emit('snackbar:show', { text: result.message, type: 'error' });
    } else {
      this.view = 'chat';
      this.contactsError = '';
      this.messageDraft = '';
      this.dialogMenuOpen = false;
      this.deleteConfirmOpen = false;
    }

    this.update();
    if (result.success)
      this.container.querySelector<HTMLInputElement>('[data-message-input]')?.focus();
  }

  private openChat(chatId: string, messageId?: string): void {
    const version = ++this.chatNavigationVersion;
    this.openingMessage = Boolean(messageId);
    window.clearTimeout(this.messageSearchTimer);
    this.messageSearch = null;
    this.view = 'chat';
    this.messageDraft = '';
    this.deleteConfirmOpen = false;
    this.leaveConfirmOpen = false;
    this.openMemberMenuId = null;
    this.createMenuOpen = false;
    this.dialogMenuOpen = false;

    if (!messageId) {
      eventBus.emit('chats:select', { id: chatId });
      return;
    }

    void this.model.selectChat(chatId, messageId).then((found) => {
      if (!this.container || version !== this.chatNavigationVersion) {
        return;
      }

      this.openingMessage = false;
      const message = this.container.querySelector<HTMLElement>(
        `[data-message-id="${CSS.escape(messageId)}"]`,
      );
      if (found && message) {
        message.focus({ preventScroll: true });
        message.scrollIntoView({ block: 'center' });
      } else if (this.view === 'chat') {
        eventBus.emit('snackbar:show', { text: 'Не удалось открыть сообщение', type: 'error' });
      }
    });
  }

  bindEvents(): void {
    this.layout.bindEvents();
  }

  private readonly handleContainerClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    if (target.closest('[data-public-profile-close]')) {
      this.closePublicProfile();
      return;
    }

    const profileBackdrop = target.closest<HTMLElement>('[data-public-profile-backdrop]');
    if (profileBackdrop && target === profileBackdrop) {
      this.closePublicProfile();
      return;
    }

    const profileUserId = target.closest<HTMLElement>('[data-open-user-profile]')?.dataset
      .openUserProfile;
    if (profileUserId) {
      this.openPublicProfile(profileUserId);
      return;
    }

    if (target.closest('[data-public-profile-add-contact]')) {
      void this.addPublicProfileToContacts();
      return;
    }

    const more = target.closest<HTMLElement>('[data-search-more]')?.dataset.searchMore as
      SearchSection | undefined;
    if (more && this.sidebarSearch && !this.sidebarSearch.results[more].loading) {
      void this.loadSidebarSearch(this.sidebarSearch, more);
      return;
    }

    const writeUserId = target.closest<HTMLElement>('[data-search-write]')?.dataset.searchWrite;
    if (writeUserId) {
      void this.startDialog(writeUserId);
      return;
    }

    const addUserId = target.closest<HTMLElement>('[data-search-add-contact]')?.dataset
      .searchAddContact;
    if (addUserId) {
      const profile = this.sidebarSearch?.results.users.items.find(
        (item) => item.id === addUserId,
      )?.profile;
      if (profile) void this.addPublicProfileToContacts(profile);
      return;
    }

    const result = target.closest<HTMLElement>('[data-search-result]')?.dataset;
    const resultId = result?.searchResult;
    if (resultId) {
      switch (result.searchSection) {
        case 'contacts': {
          const contact = this.sidebarSearch?.contacts.get(resultId);
          this.openPublicProfile(resultId, contact);
          break;
        }
        case 'chats':
          this.openChat(resultId);
          break;
        case 'messages':
          if (result.searchChat) {
            this.openChat(result.searchChat, resultId);
          }
          break;
      }
      return;
    }

    if (target.closest('[data-chat-search]') && this.model.activeChat.value) {
      this.messageSearch = {
        chatId: this.model.activeChat.value.id,
        query: '',
        items: [],
        loading: false,
        error: false,
        scrollTop: this.container?.querySelector('[data-message-history]')?.scrollTop ?? 0,
      };
      this.dialogMenuOpen = false;
      this.update();
      this.container?.querySelector<HTMLInputElement>('[name="message-search"]')?.focus();
      return;
    }
    if (target.closest('[data-close-search]')) {
      this.closeMessageSearch();
      return;
    }
    const step = target.closest<HTMLElement>('[data-search-step]')?.dataset.searchStep;
    if (step) {
      this.moveSearchResult(Number(step));
      return;
    }

    const chatItem = target.closest<HTMLElement>('[data-chat-id]');
    if (chatItem?.dataset.chatId) {
      this.openChat(chatItem.dataset.chatId);
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
      this.model.setChatFilter(this.chatFilter);
      return;
    }

    if (target.closest('[data-messages-retry]')) {
      void this.model.loadMessages();
      return;
    }

    if (target.closest('[data-message-search-more], [data-message-search-retry]')) {
      void this.loadMessageSearch();
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
      this.view = 'contact-picker';
      void this.loadContacts();
      this.update();
      return;
    }

    if (target.closest('[data-contacts-retry]')) {
      void this.loadContacts();
      return;
    }
    const contactId = target.closest<HTMLElement>('[data-contact-id]')?.dataset.contactId;
    if (contactId) {
      void this.startDialog(contactId);
      return;
    }
    if (target.closest('[data-group-add-submit]')) {
      if (this.actionPending) return;
      const ids = [...this.selectedAdditionalMemberIds];
      if (!ids.length) return;
      this.actionPending = true;
      void this.model.addMembers(ids).then((errors) => {
        this.actionPending = false;
        this.selectedAdditionalMemberIds.clear();
        if (errors.length) {
          this.createForm.membersError = errors.join('; ');
        } else {
          this.createForm.membersError = '';
          this.view = 'group-info';
        }
        this.update();
      });
      return;
    }

    if (target.closest('[data-contact-back]')) {
      this.view = 'chat';
      this.update();
      return;
    }

    if (target.closest('[data-create-group]')) {
      this.createMenuOpen = false;
      if (this.createAvatarObjectUrl) {
        URL.revokeObjectURL(this.createAvatarObjectUrl);
      }
      this.createAvatarObjectUrl = null;
      this.createAvatarFile = null;
      this.createForm = {};
      this.selectedMemberIds.clear();
      this.view = 'group-members';
      void this.loadContacts();
      this.update();
      return;
    }

    if (target.closest('[data-group-member]')) {
      const row = target.closest<HTMLElement>('[data-group-member]');
      const id = row?.dataset.groupMember;
      if (!row || !id) {
        return;
      }

      const adding = this.view === 'group-add-members';
      const selection = adding ? this.selectedAdditionalMemberIds : this.selectedMemberIds;
      const total = adding ? this.model.members.value.length : 1;
      const selectionError = this.container?.querySelector<HTMLElement>(
        '.group-create-panel__selection-error',
      );

      if (!selection.has(id) && total + selection.size >= 100) {
        this.createForm.membersError = 'В группе может быть не больше 100 участников.';
        if (selectionError) {
          selectionError.textContent = this.createForm.membersError;
        }
        return;
      }
      this.createForm.membersError = '';
      if (selectionError) {
        selectionError.textContent = '';
      }

      const selected = !selection.has(id);
      if (selected) {
        selection.add(id);
      } else {
        selection.delete(id);
      }

      updateMemberRowState(row, selected);
      const countText = groupSelectionCountText(selection, adding);
      const counters = this.container?.querySelectorAll<HTMLElement>('[data-group-selected-count]');
      for (const counter of counters ?? []) {
        counter.textContent = countText;
      }
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
      void this.loadContacts();
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

    const roleTarget = target.closest<HTMLElement>('[data-member-set-role]');
    const roleTargetId = roleTarget?.dataset.memberSetRole;
    const nextRole = roleTarget?.dataset.memberRole;
    if (roleTargetId && (nextRole === 'admin' || nextRole === 'member')) {
      if (this.actionPending) return;
      this.actionPending = true;
      this.openMemberMenuId = null;
      void this.model.updateMemberRole(roleTargetId, nextRole).then((result) => {
        this.actionPending = false;
        if (result instanceof ApiError) this.editForm.submitError = result.message;
        else this.editForm.submitError = '';
        this.update();
      });
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
      if (this.actionPending || !this.deleteConfirmOpen) return;
      this.actionPending = true;

      void this.model.deleteChat().then((result) => {
        this.actionPending = false;
        if (result instanceof ApiError) {
          this.deleteError = result.message;
        } else {
          this.deleteConfirmOpen = false;
          this.view = 'chat';
        }
        this.update();
      });
      return;
    }

    if (target.closest('[data-chat-back]')) {
      this.chatNavigationVersion += 1;
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
      const chat = this.model.activeChat.value;
      if (!chat || (chat.type === 'group' && this.model.role.value !== 'creator')) return;
      this.dialogMenuOpen = false;
      this.deleteError = '';
      this.deleteConfirmOpen = true;
      this.update();
      this.container?.querySelector<HTMLButtonElement>('[data-cancel-delete]')?.focus();
      return;
    }

    if (target.closest('[data-cancel-delete]')) {
      this.closeDeleteConfirm();
      return;
    }

    if (this.createMenuOpen || this.dialogMenuOpen || this.openMemberMenuId) {
      this.createMenuOpen = false;
      this.dialogMenuOpen = false;
      this.openMemberMenuId = null;
      this.update();
    }
  };

  private closeDeleteConfirm(): void {
    if (this.actionPending) return;
    this.deleteConfirmOpen = false;
    this.update();
    const selector =
      this.view === 'group-edit' ? '[data-dialog-delete]' : '[data-dialog-menu-toggle]';
    this.container?.querySelector<HTMLButtonElement>(selector)?.focus();
  }

  private readonly handleContainerKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.publicProfile) {
      this.closePublicProfile();
    } else if (this.deleteConfirmOpen && event.key === 'Escape') {
      event.preventDefault();
      this.closeDeleteConfirm();
    } else if (this.messageSearch && event.key === 'Escape') {
      event.preventDefault();
      this.closeMessageSearch();
    } else if (
      event.key === 'Enter' &&
      (event.target as HTMLElement)?.matches('[name="message-search"]') &&
      !event.isComposing
    ) {
      event.preventDefault();
      this.moveSearchResult(event.shiftKey ? -1 : 1);
    }
  };

  private readonly handleContainerInput = (event: Event): void => {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement | null;
    if (!input) {
      return;
    }

    if (input.name === 'sidebar-search') {
      window.clearTimeout(this.searchTimer);
      this.searchQuery = input.value;
      const query = input.value.trim();
      const search = query ? new SidebarSearchModel(query) : null;
      this.sidebarSearch = search;
      this.update();
      const list = this.container?.querySelector('.chat-panel__list');
      if (list) {
        list.scrollTop = 0;
      }

      if (search) {
        this.searchTimer = window.setTimeout(() => {
          for (const section of SEARCH_SECTIONS) {
            void this.loadSidebarSearch(search, section);
          }
        }, 250);
      }
      return;
    }

    if (input.name === 'message-search' && this.messageSearch) {
      window.clearTimeout(this.messageSearchTimer);
      this.messageSearchVersion += 1;
      this.messageSearch.query = input.value;
      this.messageSearch.currentId = undefined;
      this.messageSearch.items = [];
      this.messageSearch.before = undefined;
      this.messageSearch.error = false;
      this.messageSearch.loading = Boolean(input.value.trim());
      if (this.messageSearch.loading) {
        this.messageSearchTimer = window.setTimeout(() => void this.loadMessageSearch(), 250);
      }
      this.update();
      const history = this.container?.querySelector<HTMLElement>('[data-message-history]');
      if (history) history.scrollTop = 0;
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
        .then(async (result) => {
          if (!(result instanceof ApiError) && this.createAvatarFile) {
            const upload = await this.model.uploadGroupAvatar(this.createAvatarFile);
            if (upload instanceof ApiError) {
              eventBus.emit('snackbar:show', {
                text: `Группа создана, но фото не загружено: ${upload.message}`,
                type: 'error',
              });
              this.createForm.submitting = false;
              this.view = 'group-info';
              this.update();
              return;
            }
          }
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
        .then(async (result) => {
          if (!(result instanceof ApiError) && this.editAvatarFile) {
            const upload = await this.model.uploadGroupAvatar(this.editAvatarFile);
            if (upload instanceof ApiError) {
              this.editForm.submitError = upload.message;
              this.editForm.submitting = false;
              this.update();
              return;
            }
          }
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

  private async loadContacts(): Promise<void> {
    const version = ++this.contactRequestVersion;
    this.contactsLoading = true;
    this.contactsError = '';
    this.update();

    const contacts: ContactPreview[] = [];
    let offset = 0;
    while (true) {
      const result = await ContactsApi.getContacts({ limit: 20, offset });
      if (version !== this.contactRequestVersion) return;
      if (result instanceof ApiError) {
        this.contactsError = result.message;
        break;
      }
      const page = result.data ?? [];
      contacts.push(
        ...page.map((contact: Contact): ContactPreview => {
          const name =
            contact.pseudonym ||
            [contact.first_name, contact.last_name].filter(Boolean).join(' ') ||
            contact.nickname;
          return {
            id: contact.contact_user_id,
            name,
            nickname: contact.nickname,
            initials: getChatInitials(name),
            avatarUrl: contact.icon_url ?? undefined,
            online: contact.is_online,
          };
        }),
      );
      if (page.length < 20) break;
      offset += page.length;
    }

    if (!this.contactsError) {
      this.contacts = contacts;
      const memberIds = new Set(this.model.members.value.map((member) => member.user_id));
      this.groupContacts = contacts
        .filter((contact) => this.view !== 'group-add-members' || !memberIds.has(contact.id))
        .map((contact) => ({
          id: contact.id,
          name: contact.name,
          initials: contact.initials,
          avatarUrl: contact.avatarUrl,
          status: contact.online ? 'в сети' : contact.nickname,
        }));
    }
    this.contactsLoading = false;
    this.update();
  }

  async afterMount(): Promise<void> {
    this.container?.addEventListener('click', this.handleContainerClick);
    this.container?.addEventListener('keydown', this.handleContainerKeydown);
    this.container?.addEventListener('input', this.handleContainerInput);
    this.container?.addEventListener('change', this.handleContainerChange);
    this.container?.addEventListener('submit', this.handleContainerSubmit);
    this.model.start();
  }

  unmount(): void {
    window.clearTimeout(this.searchTimer);
    this.sidebarSearch = null;
    this.chatNavigationVersion += 1;
    window.clearTimeout(this.messageSearchTimer);
    this.messageSearchVersion += 1;
    this.container?.removeEventListener('click', this.handleContainerClick);
    this.container?.removeEventListener('keydown', this.handleContainerKeydown);
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
    super.unmount();
    this.chatScroll.disconnect();
    this.messageScroll.disconnect();
    this.model.destroy();
  }
}
