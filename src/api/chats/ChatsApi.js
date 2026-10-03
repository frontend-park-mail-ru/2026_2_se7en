import { GET_CHATS_URL, USE_MOCKS } from './chats.constants.js';
import { ServerApi } from '../ServerApi.js';
import { MockChatsApi } from './MockChatsApi.js';

/**
 * Класс для взаимодействия с API чатов.
 */
export class ChatsApi extends ServerApi {
  /**
   * @param {Object} [params]
   * @param {number} [params.limit=20]
   * @param {number} [params.offset=0]
   * @returns {Promise<ApiSuccess | ApiError>}
   */
  static async getChats({ limit = 20, offset = 0 } = {}) {
    if (USE_MOCKS) {
      return MockChatsApi.getChats({ limit, offset });
    }
    return this._request(`${GET_CHATS_URL}?limit=${limit}&offset=${offset}`);
  }
}
