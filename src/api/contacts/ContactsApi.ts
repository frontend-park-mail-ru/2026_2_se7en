import type { ApiResult } from '@/api/ApiResponse.ts';
import { GET_CONTACTS_URL } from '@/api/contacts/contacts.constants.ts';
import { ServerApi } from '@/api/ServerApi.ts';
import { joinSearchParams } from '@/helpers/JoinSearchParams.ts';
import type {
  ContactsResponse,
  CreateContactRequest,
  DeleteContactRequest,
} from '@/api/contacts/contacts.types.ts';

/** API контактов. */
export class ContactsApi extends ServerApi {
  static async getContacts(
    params: { q?: string; limit?: number; offset?: number } = {},
  ): Promise<ApiResult<ContactsResponse>> {
    const query = joinSearchParams(params);
    return this._request<ContactsResponse>(`${GET_CONTACTS_URL}${query ? `?${query}` : ''}`);
  }

  static async createContact(data: CreateContactRequest): Promise<ApiResult<void>> {
    return this._request<void>(GET_CONTACTS_URL, { method: 'POST', body: data });
  }

  static async deleteContact(data: DeleteContactRequest): Promise<ApiResult<void>> {
    return this._request<void>(GET_CONTACTS_URL, { method: 'DELETE', body: data });
  }
}
