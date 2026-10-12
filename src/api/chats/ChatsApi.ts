import { GET_CHATS_URL } from '@/api/chats/chats.constants.ts';
import { ServerApi } from '@/api/ServerApi.ts';
import { mockGetChats } from '@/api/chats/chats.mock.ts';
import { USING_MOCK } from '@/api/api.constants.ts';
import { joinSearchParams } from '@/helpers/JoinSearchParams.ts';
import type { ApiResult } from '@/api/ApiResponse.ts';
import type { ChatsResponse, GetChatsParams } from '@/api/chats/chats.types.ts';

/**
 * API чатов.
 */
export class ChatsApi extends ServerApi {
  static async getChats(params: GetChatsParams = {}): Promise<ApiResult<ChatsResponse>> {
    const paramsWithDefaults = { limit: 20, offset: 0, ...params };

    if (USING_MOCK.CHATS) {
      return mockGetChats(paramsWithDefaults);
    }

    return this._request<ChatsResponse>(`${GET_CHATS_URL}?${joinSearchParams(paramsWithDefaults)}`);
  }
}
