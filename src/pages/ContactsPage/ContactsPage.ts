import './ContactsPage.scss';
import { ApiError } from '@/api/ApiResponse.ts';
import { ChatArea } from '@/components/chat/ChatArea.ts';
import { ChatsPageModel } from '@/pages/ChatsPage/ChatsPage.model.ts';
import { ContactDialog } from '@/components/contacts/ContactDialog.ts';
import { ContactsApi } from '@/api/contacts/ContactsApi.ts';
import { ContactsList } from '@/components/contacts/ContactsList.ts';
import { ContactsPageModel } from './ContactsPage.model.ts';
import { DefaultLayout } from '@/layouts/DefaultLayout.ts';
import type { Message } from '@/api/chats/chats.types.ts';
import { Page } from '@/pages/Page.ts';
import { PublicProfileModal } from '@/components/profile/PublicProfileModal.ts';
import type { PublicProfileView } from '@/components/profile/PublicProfileModal.ts';
import { ROUTES } from '@/constants/Routes.ts';
import { eventBus } from '@/helpers/EventBus.ts';
import { user } from '@/store/User.ts';
import { formatMessageTime, getChatInitials } from '@/helpers/chat.ts';

/**
 * View страницы контактов.
 * */
export class ContactsPage extends Page {
  static route = ROUTES.CONTACTS;

  private readonly model = new ContactsPageModel();
  private readonly layout = new DefaultLayout();
  private readonly contactsList = new ContactsList();
  private readonly contactDialog = new ContactDialog();
  private readonly chatModel = new ChatsPageModel();
  private readonly chatArea = new ChatArea();
  private searchTimer: number | null = null;
  private messageDraft = '';
  private dialogMenuOpen = false;
  private deleteConfirmOpen = false;
  private contactMenuOpenId: string | null = null;
  private pendingContactDeleteId: string | null = null;
  private publicProfile: PublicProfileView | null = null;

  constructor() {
    super();

    this.setSubscribers(
      [this.model.contacts, this.model.activeContact, this.model.isLoading, this.model.hasError],
      () => this.update(),
    );
    this.setSubscribers(
      [
        this.chatModel.activeChat,
        this.chatModel.chats,
        this.chatModel.members,
        this.chatModel.messages,
        this.chatModel.messagesLoading,
        this.chatModel.messagesError,
        this.chatModel.sendError,
        this.chatModel.sending,
        this.chatModel.hasMoreMessages,
        this.chatModel.typingUsers,
      ],
      () => this.update(),
    );
  }

  render(): string {
    const isLoading = this.model.isLoading.value;
    const hasError = this.model.hasError.value;
    const contacts = this.model.contacts.value;
    const chat = this.chatModel.activeChat.value;
    const peerUserId = this.chatModel.members.value.find(
      (member) => member.user_id !== user.getId(),
    )?.user_id;
    const messages: Message[] = this.chatModel.messages.value.map((message) => ({
      id: message.id,
      text: message.content ?? '',
      isOutgoing: message.user_id === user.getId(),
      isRead: message.is_read,
      time: formatMessageTime(new Date(message.created_at)),
    }));
    const rightPanel = chat
      ? this.chatArea.render(chat, this.chatModel.chats.value, false, false, {
          messages,
          messagesLoading: this.chatModel.messagesLoading.value,
          messagesError: this.chatModel.messagesError.value,
          sendError: this.chatModel.sendError.value,
          sending: this.chatModel.sending.value,
          hasMoreMessages: this.chatModel.hasMoreMessages.value,
          draft: this.messageDraft,
          typingLabel: this.chatModel.typingUsers.value.length ? 'Собеседник печатает…' : '',
          peerUserId,
          menuOpen: this.dialogMenuOpen,
          deleteConfirmOpen: this.deleteConfirmOpen,
        })
      : this.contactDialog.render();

    return this.layout.render(
      `
      <main class="contacts-page">
        ${this.contactsList.render(
          contacts,
          this.model.activeContact.value?.id ?? null,
          isLoading,
          hasError,
          contacts.length,
          this.model.query,
          this.contactMenuOpenId,
          this.pendingContactDeleteId,
        )}
        ${rightPanel}
      </main>
      ${PublicProfileModal(this.publicProfile)}
    `,
      'layout_messenger layout_contacts',
    );
  }

  private update(): void {
    if (!this.container) return;
    const focusedInput = document.activeElement?.matches(
      'input[name="contact-search"], [data-message-input]',
    )
      ? (document.activeElement as HTMLInputElement)
      : null;
    const selector = focusedInput?.matches('[data-message-input]')
      ? '[data-message-input]'
      : 'input[name="contact-search"]';
    const start = focusedInput?.selectionStart;
    const end = focusedInput?.selectionEnd;
    this.container.innerHTML = this.render();
    if (focusedInput) {
      const next = this.container.querySelector<HTMLInputElement>(selector);
      next?.focus();
      if (start != null && end != null) next?.setSelectionRange(start, end);
    }
  }

  private updateContactItems(): void {
    const list = this.container?.querySelector<HTMLElement>('[data-contact-list]');
    if (!list) return;

    list.innerHTML = this.contactsList.renderItems(
      this.model.contacts.value,
      this.model.activeContact.value?.id ?? null,
      this.model.isLoading.value,
      this.model.hasError.value,
      this.model.contacts.value.length,
      this.model.query,
      this.contactMenuOpenId,
      this.pendingContactDeleteId,
    );
  }

  bindEvents(): void {
    this.layout.bindEvents();
    this.container?.addEventListener('click', this.handleContainerClick);
    this.container?.addEventListener('keydown', this.handleContainerKeydown);
    this.container?.addEventListener('input', this.handleContainerInput);
    this.container?.addEventListener('submit', this.handleContainerSubmit);
  }

  private readonly handleContainerInput = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    if (input.matches('[data-message-input]')) {
      this.messageDraft = input.value;
      this.chatModel.updateTyping(input.value);
      const sendButton = this.container?.querySelector<HTMLButtonElement>('.chat-area__send');
      if (sendButton) sendButton.disabled = !input.value.trim();
      return;
    }
    if (input.name !== 'contact-search') return;
    this.model.query = input.value;
    if (this.searchTimer !== null) window.clearTimeout(this.searchTimer);
    this.searchTimer = window.setTimeout(() => {
      this.searchTimer = null;
      void this.model.loadContacts();
    }, 250);
  };

  private readonly handleContainerKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.publicProfile) {
      this.closePublicProfile();
    }
  };

  private readonly handleContainerClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

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

    const addContactButton = target.closest('[data-public-profile-add-contact]');
    if (addContactButton && this.publicProfile) {
      void this.addPublicProfileToContacts();
      return;
    }

    const contactMenuId = target.closest<HTMLElement>('[data-contact-menu-toggle]')?.dataset
      .contactMenuToggle;
    if (contactMenuId) {
      this.contactMenuOpenId = this.contactMenuOpenId === contactMenuId ? null : contactMenuId;
      this.updateContactItems();
      return;
    }

    const deleteContactId =
      target.closest<HTMLElement>('[data-contact-delete]')?.dataset.contactDelete;
    if (deleteContactId) {
      void this.deleteContact(deleteContactId);
      return;
    }

    if (this.contactMenuOpenId && !target.closest('[data-contact-row]')) {
      this.contactMenuOpenId = null;
      this.updateContactItems();
    }

    const contactItem = target.closest<HTMLElement>('[data-contact-id]');
    if (contactItem?.dataset.contactId) {
      this.openDialog(contactItem.dataset.contactId);
      return;
    }

    if (target.closest('[data-messages-retry]')) {
      void this.chatModel.loadMessages();
      return;
    }
    if (target.closest('[data-messages-more]')) {
      void this.chatModel.loadOlderMessages();
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
    if (target.closest('[data-confirm-delete]')) {
      void this.chatModel.deleteChat().then((result) => {
        if (result instanceof ApiError) {
          eventBus.emit('snackbar:show', { text: result.message, type: 'error' });
        } else {
          this.deleteConfirmOpen = false;
          this.model.activeContact.value = null;
        }
        this.update();
      });
      return;
    }

    if (target.closest('#contacts-retry')) {
      eventBus.emit('contacts:load');
    }
  };

  private readonly handleContainerSubmit = (event: SubmitEvent): void => {
    if (!(event.target as HTMLElement).matches('[data-message-form]')) return;
    event.preventDefault();
    const text = this.messageDraft.trim();
    if (!text || this.chatModel.sending.value) return;
    void this.chatModel.sendMessage(text).then((sent) => {
      if (sent) {
        this.messageDraft = '';
        this.update();
      }
    });
  };

  private openDialog(peerId: string): void {
    eventBus.emit('contacts:select', { id: peerId });
    this.messageDraft = '';
    this.dialogMenuOpen = false;
    this.deleteConfirmOpen = false;
    this.contactMenuOpenId = null;
    void this.chatModel.createDialog(peerId).then((result) => {
      if (this.model.activeContact.value?.id !== peerId) return;
      if (result instanceof ApiError) {
        eventBus.emit('snackbar:show', { text: result.message, type: 'error' });
      } else {
        this.container?.querySelector<HTMLInputElement>('[data-message-input]')?.focus();
      }
    });
  }

  private openPublicProfile(userId: string): void {
    const member = this.chatModel.members.value.find((candidate) => candidate.user_id === userId);
    if (!member?.profile) return;

    const profile = member.profile;
    const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
    const name = fullName || profile.nickname;
    this.publicProfile = {
      userId,
      firstName: profile.first_name,
      lastName: profile.last_name,
      nickname: profile.nickname,
      avatarUrl: profile.icon_url,
      initials: getChatInitials(name),
      isContact: true,
    };
    this.contactMenuOpenId = null;
    this.update();
    this.container?.querySelector<HTMLButtonElement>('[data-public-profile-close]')?.focus();
  }

  private closePublicProfile(): void {
    this.publicProfile = null;
    this.update();
  }

  private async addPublicProfileToContacts(): Promise<void> {
    const profile = this.publicProfile;
    if (!profile || profile.isContact || profile.isAddingContact) return;

    profile.isAddingContact = true;
    this.update();
    const result = await ContactsApi.createContact({ nickname: profile.nickname });
    if (this.publicProfile?.userId === profile.userId) {
      this.publicProfile.isAddingContact = false;
      if (result.success || (result instanceof ApiError && result.status === 409)) {
        this.publicProfile.isContact = true;
      }
      this.update();
    }
    if (result.success) {
      eventBus.emit('snackbar:show', { text: 'Контакт добавлен', type: 'success' });
    } else if (result instanceof ApiError && result.status === 409) {
      eventBus.emit('snackbar:show', { text: 'Пользователь уже в контактах', type: 'info' });
    } else if (result instanceof ApiError) {
      eventBus.emit('snackbar:show', { text: result.message, type: 'error' });
    }
  }

  private async deleteContact(contactId: string): Promise<void> {
    if (this.pendingContactDeleteId) return;

    this.pendingContactDeleteId = contactId;
    this.updateContactItems();
    const result = await ContactsApi.deleteContact({ contact_user_id: contactId });
    this.pendingContactDeleteId = null;
    this.contactMenuOpenId = null;

    if (result instanceof ApiError) {
      eventBus.emit('snackbar:show', { text: result.message, type: 'error' });
      this.updateContactItems();
      return;
    }

    this.model.contacts.value = this.model.contacts.value.filter(
      (contact) => contact.id !== contactId,
    );
    if (this.model.activeContact.value?.id === contactId) {
      this.model.activeContact.value = null;
    }
    eventBus.emit('snackbar:show', { text: 'Контакт удалён', type: 'success' });
  }

  async afterMount(): Promise<void> {
    this.chatModel.start(false);
    eventBus.emit('contacts:load');
  }

  unmount(): void {
    this.container?.removeEventListener('click', this.handleContainerClick);
    this.container?.removeEventListener('keydown', this.handleContainerKeydown);
    this.container?.removeEventListener('input', this.handleContainerInput);
    this.container?.removeEventListener('submit', this.handleContainerSubmit);
    if (this.searchTimer !== null) window.clearTimeout(this.searchTimer);
    this.chatModel.destroy();
    this.layout.unmount();
    this.model.destroy();
    super.unmount();
  }
}
