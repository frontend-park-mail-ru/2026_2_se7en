import { GET_CHATS_URL } from './chats.constants.js';
import { ServerApi } from '../ServerApi.js';
import { mockGetChats } from './chats.mock.js';
import { USING_MOCK } from '../api.constants.js';

export class ChatsApi extends ServerApi {
  static async getChats({ limit = 20, offset = 0 } = {}) {
    if (USING_MOCK.CHATS) {
      return mockGetChats({ limit, offset });
    }
    return this._request(`${GET_CHATS_URL}?limit=${limit}&offset=${offset}`);
  }
}
