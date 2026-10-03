import { GET_CHATS_URL } from './chats.constants.js';
import { ServerApi } from '../ServerApi.js';

/**
 * Класс для взаимодействия с API чатов.
 */
export class ChatsApi {
  /**
   * @param {Object} [params]
   * @param {number} [params.limit=20]
   * @param {number} [params.offset=0]
   * @returns {Promise<ApiSuccess | ApiError>}
   */
  static async getChats({ limit = 20, offset = 0 } = {}) {
    return ServerApi._request(`${GET_CHATS_URL}?limit=${limit}&offset=${offset}`);
  }
}
