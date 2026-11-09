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
  query = '';

  private isFetching = false;
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
    this.offLoad();
    this.offSelect();
  }

  async loadContacts(): Promise<void> {
    const version = ++this.requestVersion;
    const query = this.query.trim();
    this.isFetching = true;
    this.isLoading.value = true;
    this.hasError.value = false;

    const contacts: DisplayContact[] = [];
    let offset = 0;
    while (true) {
      const response = await ContactsApi.getContacts({ q: query || undefined, limit: 20, offset });
      if (version !== this.requestVersion) return;
      if (response instanceof ApiError) {
        if (response.status !== STATUSES.UNAUTHORIZED) {
          this.hasError.value = true;
          if (response.code !== ERROR_CODES.NETWORK_ERROR) debugError(response.message);
        }
        break;
      }
      const page = response.data ?? [];
      contacts.push(...page.map(toDisplayContact));
      if (page.length < 20) break;
      offset += page.length;
    }

    if (!this.hasError.value) this.contacts.value = contacts;
    this.activeContact.value = null;
    this.isLoading.value = false;
    this.isFetching = false;
  }
}
