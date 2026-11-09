import type { ApiResult } from '@/api/ApiResponse.ts';
import type { ContactsResponse } from '@/api/contacts/contacts.types.ts';
import { GET_CONTACTS_URL } from '@/api/contacts/contacts.constants.ts';
import { ServerApi } from '@/api/ServerApi.ts';
import { joinSearchParams } from '@/helpers/JoinSearchParams.ts';

/** API контактов. */
export class ContactsApi extends ServerApi {
  static async getContacts(
    params: { q?: string; limit?: number; offset?: number } = {},
  ): Promise<ApiResult<ContactsResponse>> {
    const query = joinSearchParams(params);
    return this._request<ContactsResponse>(`${GET_CONTACTS_URL}${query ? `?${query}` : ''}`);
  }
}
