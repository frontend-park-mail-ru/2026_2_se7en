import type { ApiResult } from '@/api/ApiResponse.ts';
import type { ContactsResponse } from '@/api/contacts/contacts.types.ts';
import { GET_CONTACTS_URL } from '@/api/contacts/contacts.constants.ts';
import { ServerApi } from '@/api/ServerApi.ts';

/** API контактов. */
export class ContactsApi extends ServerApi {
  static async getContacts(): Promise<ApiResult<ContactsResponse>> {
    return this._request<ContactsResponse>(GET_CONTACTS_URL);
  }
}
