import { ServerApi } from '../ServerApi.js';
import { GET_CHATS_URL } from './chats.constants.js';

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
    return this._request(`${GET_CHATS_URL}?limit=${limit}&offset=${offset}`);
  }
}
