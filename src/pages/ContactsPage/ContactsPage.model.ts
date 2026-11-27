import { ApiError } from '@/api/ApiResponse.ts';
import { ContactsApi } from '@/api/contacts/ContactsApi.ts';
import type { DisplayContact } from '@/api/contacts/contacts.types.ts';
import { ERROR_CODES } from '@/api/error.constants.ts';
import { PagedWindow } from '@/helpers/PagedWindow.ts';
import { STATUSES } from '@/constants/Statuses.ts';
import { Signal } from '@/reactive/Signal.ts';
import { debugError } from '@/helpers/DebugError.ts';
import { eventBus } from '@/helpers/EventBus.ts';
import { toDisplayContact } from '@/helpers/contact.ts';

const CONTACTS_PAGE_SIZE = 20;

/**
 * Модель страницы контактов.
 * */
export class ContactsPageModel {
  private loadedQuery = '';
  readonly pagination = new PagedWindow<DisplayContact, number>(async (cursor) => {
    const offset = cursor ?? 0;
    const response = await ContactsApi.getContacts({
      q: this.loadedQuery || undefined,
      limit: CONTACTS_PAGE_SIZE,
      offset,
    });
    if (response instanceof ApiError) return response;
    const page = response.data ?? [];
    return {
      items: page.map(toDisplayContact),
      next: page.length === CONTACTS_PAGE_SIZE ? offset + page.length : null,
    };
  });
  readonly contacts = this.pagination.items;
  readonly activeContact = new Signal<DisplayContact | null>(null);
  readonly isLoading = new Signal<boolean>(true);
  readonly hasError = new Signal<boolean>(false);
  query = '';

  private requestVersion = 0;

  private readonly offLoad: () => void;
  private readonly offSelect: () => void;

  constructor() {
    this.offLoad = eventBus.on('contacts:load', () => {
      void this.loadContacts();
    });

    this.offSelect = eventBus.on('contacts:select', ({ id }) => {
      this.activeContact.value = this.contacts.value.find((contact) => contact.id === id) ?? null;
    });
  }

  destroy(): void {
    this.requestVersion += 1;
    this.pagination.reset();
    this.offLoad();
    this.offSelect();
  }

  async loadContacts(silent = false): Promise<void> {
    if (silent && this.pagination.state.value.pending) return;
    const version = ++this.requestVersion;
    if (!silent) {
      this.loadedQuery = this.query.trim();
      this.isLoading.value = true;
      this.hasError.value = false;
      this.pagination.reset();
    }

    const response = await this.pagination.load('refresh');
    if (version !== this.requestVersion) return;
    if (response instanceof ApiError && response.status !== STATUSES.UNAUTHORIZED) {
      if (!silent) this.hasError.value = true;
      if (response.code !== ERROR_CODES.NETWORK_ERROR) debugError(response.message);
    }

    this.isLoading.value = false;
  }
}
