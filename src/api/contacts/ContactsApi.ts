import type { ApiResult } from '@/api/ApiResponse.ts';
import { ApiSuccess } from '@/api/ApiResponse';
import type { ContactsResponse } from '@/api/contacts/contacts.types.ts';
import { GET_CONTACTS_URL } from '@/api/contacts/contacts.constants.ts';
import { ServerApi } from '@/api/ServerApi.ts';
import { USING_MOCK } from '@/api/api.constants';
import { user } from '@/store/User';
import { mockAddContact, mockGetContacts, mockSaveContact } from './contacts.mock';

/** API контактов. */
export class ContactsApi extends ServerApi {
  static async getContacts(): Promise<ApiResult<ContactsResponse>> {
    if (USING_MOCK.CONTACTS) return mockGetContacts(user.getId());
    const contacts: ContactsResponse = [];
    const limit = 100;
    while (true) {
      const result = await this._request<ContactsResponse>(
        `${GET_CONTACTS_URL}?limit=${limit}&offset=${contacts.length}`,
      );
      if (result.success === false) return result;
      const page = result.data ?? [];
      contacts.push(...page);
      if (page.length < limit) return new ApiSuccess(contacts, result.status);
    }
  }

  static async addContact(nickname: string, pseudonym: string): Promise<ApiResult<null>> {
    if (USING_MOCK.CONTACTS) return mockAddContact(user.getId(), nickname, pseudonym);
    return this._request<null>(GET_CONTACTS_URL, {
      method: 'POST',
      body: { nickname, pseudonym },
    });
  }

  static async removeContact(id: string): Promise<ApiResult<null>> {
    if (USING_MOCK.CONTACTS) return mockSaveContact(user.getId(), id, null);
    return this._request<null>(GET_CONTACTS_URL, {
      method: 'DELETE',
      body: { contact_user_id: id },
    });
  }
}
