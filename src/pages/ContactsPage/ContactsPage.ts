import './ContactsPage.scss';
import { ApiError } from '@/api/ApiResponse.ts';
import { ChatArea } from '@/components/chat/ChatArea.ts';
import { ChatsPageModel } from '@/pages/ChatsPage/ChatsPage.model.ts';
import { ContactDialog } from '@/components/contacts/ContactDialog.ts';
import { ContactsList } from '@/components/contacts/ContactsList.ts';
import { ContactsPageModel } from './ContactsPage.model.ts';
import { DefaultLayout } from '@/layouts/DefaultLayout.ts';
import type { Message } from '@/api/chats/chats.types.ts';
import { Page } from '@/pages/Page.ts';
import { ROUTES } from '@/constants/Routes.ts';
import { eventBus } from '@/helpers/EventBus.ts';
import { formatMessageTime } from '@/helpers/chat.ts';
import { user } from '@/store/User.ts';

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
  private openingDialog = false;
  private searchTimer: number | null = null;
  private messageDraft = '';
  private dialogMenuOpen = false;
  private deleteConfirmOpen = false;

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
          menuOpen: this.dialogMenuOpen,
          deleteConfirmOpen: this.deleteConfirmOpen,
        })
      : this.contactDialog.render(contacts.length > 0);

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
        )}
        ${rightPanel}
      </main>
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
    );
  }

  bindEvents(): void {
    this.layout.bindEvents();
    this.container?.addEventListener('click', this.handleContainerClick);
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

  private readonly handleContainerClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

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
    if (this.openingDialog) return;
    this.openingDialog = true;
    eventBus.emit('contacts:select', { id: peerId });
    this.chatModel.activeChat.value = null;
    this.messageDraft = '';
    this.dialogMenuOpen = false;
    this.deleteConfirmOpen = false;
    void this.chatModel.createDialog(peerId).then((result) => {
      this.openingDialog = false;
      if (result instanceof ApiError) {
        eventBus.emit('snackbar:show', { text: result.message, type: 'error' });
      } else {
        this.container?.querySelector<HTMLInputElement>('[data-message-input]')?.focus();
      }
    });
  }

  async afterMount(): Promise<void> {
    this.chatModel.start(false);
    eventBus.emit('contacts:load');
  }

  unmount(): void {
    this.container?.removeEventListener('click', this.handleContainerClick);
    this.container?.removeEventListener('input', this.handleContainerInput);
    this.container?.removeEventListener('submit', this.handleContainerSubmit);
    if (this.searchTimer !== null) window.clearTimeout(this.searchTimer);
    this.chatModel.destroy();
    this.layout.unmount();
    this.model.destroy();
    super.unmount();
  }
}
