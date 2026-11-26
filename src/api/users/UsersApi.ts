import { ServerApi } from '@/api/ServerApi.ts';
import type { UsersListResponse } from '@/api/users/users.types.ts';
import { joinSearchParams } from '@/helpers/JoinSearchParams.ts';
import { GET_USERS_URL, USERS_PAGE_SIZE } from '@/api/users/users.constants.ts';

/** Поиск пользователей по части никнейма. */
export class UsersApi extends ServerApi {
  static async getUsers(params: { q: string; limit?: number; offset?: number }) {
    const query = joinSearchParams({
      q: params.q,
      limit: params.limit ?? USERS_PAGE_SIZE,
      offset: params.offset ?? 0,
    });
    return this._request<UsersListResponse>(`${GET_USERS_URL}?${query}`);
  }
}
