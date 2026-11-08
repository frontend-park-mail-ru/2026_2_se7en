import './ContactsPage.scss';
import { ContactDialog } from '@/components/contacts/ContactDialog.ts';
import { ContactsList } from '@/components/contacts/ContactsList.ts';
import { ContactsPageModel } from './ContactsPage.model.ts';
import { DefaultLayout } from '@/layouts/DefaultLayout.ts';
import { Page } from '@/pages/Page.ts';
import { ROUTES } from '@/constants/Routes.ts';
import { eventBus } from '@/helpers/EventBus.ts';

/**
 * View страницы контактов.
 * */
export class ContactsPage extends Page {
  static route = ROUTES.CONTACTS;

  private readonly model = new ContactsPageModel();
  private readonly layout = new DefaultLayout();
  private readonly contactsList = new ContactsList();
  private readonly contactDialog = new ContactDialog();

  constructor() {
    super();

    this.setSubscribers(
      [this.model.contacts, this.model.activeContact, this.model.isLoading, this.model.hasError],
      () => this.update(),
    );
  }

  render(): string {
    const isLoading = this.model.isLoading.value;
    const hasError = this.model.hasError.value;
    const contacts = this.model.contacts.value;

    return this.layout.render(`
      <main class="contacts-page">
        ${this.contactsList.render(
          this.model.filteredContacts,
          this.model.activeContact.value?.id ?? null,
          isLoading,
          hasError,
          this.model.searchQuery,
          contacts.length,
        )}
        ${this.contactDialog.render(this.model.activeContact.value, contacts.length > 0)}
      </main>
    `);
  }

  private update(): void {
    if (!this.container) return;

    this.container.innerHTML = this.render();
  }

  private updateContactItems(): void {
    const list = this.container?.querySelector<HTMLElement>('[data-contact-list]');
    if (!list) return;

    list.innerHTML = this.contactsList.renderItems(
      this.model.filteredContacts,
      this.model.activeContact.value?.id ?? null,
      this.model.isLoading.value,
      this.model.hasError.value,
      this.model.contacts.value.length,
    );
  }

  bindEvents(): void {
    this.layout.bindEvents();
    this.container?.addEventListener('click', this.handleContainerClick);
    this.container?.addEventListener('input', this.handleContainerInput);
  }

  private readonly handleContainerClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const contactItem = target.closest<HTMLElement>('[data-contact-id]');
    if (contactItem?.dataset.contactId) {
      eventBus.emit('contacts:select', { id: contactItem.dataset.contactId });
      return;
    }

    if (target.closest('#contacts-retry')) {
      eventBus.emit('contacts:load');
    }
  };

  private readonly handleContainerInput = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.id !== 'contacts-search') return;

    eventBus.emit('contacts:search', { query: target.value });
    this.updateContactItems();
  };

  async afterMount(): Promise<void> {
    this.bindEvents();
    eventBus.emit('contacts:load');
  }

  unmount(): void {
    this.container?.removeEventListener('click', this.handleContainerClick);
    this.container?.removeEventListener('input', this.handleContainerInput);
    this.layout.unmount();
    this.model.destroy();
    super.unmount();
  }
}
