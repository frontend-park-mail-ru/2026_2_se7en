import { GET_CHATS_URL } from '@/api/chats/chats.constants.ts';
import { ServerApi } from '@/api/ServerApi.ts';
import { mockGetChats } from '@/api/chats/chats.mock.ts';
import { USING_MOCK } from '@/api/api.constants.ts';
import type { ApiResult } from '@/api/ApiResponse.ts';
import type { ChatsResponse, GetChatsParams } from '@/api/chats/chats.types.ts';

export class ChatsApi extends ServerApi {
  static async getChats({ limit = 20, offset = 0 }: GetChatsParams = {}): Promise<
    ApiResult<ChatsResponse>
  > {
    if (USING_MOCK.CHATS) {
      return mockGetChats({ limit, offset });
    }

    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });

    return this._request<ChatsResponse>(`${GET_CHATS_URL}?${params.toString()}`);
  }
}
