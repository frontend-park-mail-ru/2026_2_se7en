import { ApiError } from '@/api/ApiResponse.ts';
import { ContactsApi } from '@/api/contacts/ContactsApi.ts';
import type { DisplayContact } from '@/api/contacts/contacts.types.ts';
import { ERROR_CODES } from '@/api/error.constants.ts';
import { STATUSES } from '@/constants/Statuses.ts';
import { Signal } from '@/reactive/Signal.ts';
import { debugError } from '@/helpers/DebugError.ts';
import { eventBus } from '@/helpers/EventBus.ts';
import { toDisplayContact } from '@/helpers/contact.ts';

/**
 * Модель страницы контактов.
 * */
export class ContactsPageModel {
  readonly contacts = new Signal<DisplayContact[]>([]);
  readonly activeContact = new Signal<DisplayContact | null>(null);
  readonly isLoading = new Signal<boolean>(true);
  readonly hasError = new Signal<boolean>(false);

  searchQuery = '';
  private isFetching = false;

  private readonly offLoad: () => void;
  private readonly offSelect: () => void;
  private readonly offSearch: () => void;

  constructor() {
    this.offLoad = eventBus.on('contacts:load', () => {
      void this.loadContacts();
    });

    this.offSelect = eventBus.on('contacts:select', ({ id }) => {
      this.activeContact.value = this.contacts.value.find((contact) => contact.id === id) ?? null;
    });

    this.offSearch = eventBus.on('contacts:search', ({ query }) => {
      this.searchQuery = query;
    });
  }

  destroy(): void {
    this.offLoad();
    this.offSelect();
    this.offSearch();
  }

  get filteredContacts(): DisplayContact[] {
    const query = this.searchQuery.trim().toLocaleLowerCase('ru-RU');

    if (!query) return this.contacts.value;

    return this.contacts.value.filter((contact) =>
      contact.searchText.toLocaleLowerCase('ru-RU').includes(query),
    );
  }

  private async loadContacts(): Promise<void> {
    if (this.isFetching) return;

    this.isFetching = true;
    this.isLoading.value = true;
    this.hasError.value = false;

    const response = await ContactsApi.getContacts();

    if (response instanceof ApiError) {
      if (response.status !== STATUSES.UNAUTHORIZED) {
        this.hasError.value = true;

        if (response.code !== ERROR_CODES.NETWORK_ERROR) {
          debugError(response.message);
        }
      }

      this.contacts.value = [];
      this.activeContact.value = null;
    } else {
      this.contacts.value = (response.data?.items ?? []).map(toDisplayContact);
      this.activeContact.value = null;
    }

    this.isLoading.value = false;
    this.isFetching = false;
  }
}
