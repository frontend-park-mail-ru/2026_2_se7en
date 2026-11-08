import { BASE_URL } from '@/api/api.constants.ts';
import { MS_IN_SECOND } from '@/constants/Time.ts';

export const WS_PATH = `${BASE_URL}/ws`;

export const WS_RECONNECT_BASE_DELAY_MS = MS_IN_SECOND;
export const WS_RECONNECT_MAX_DELAY_MS = 30 * MS_IN_SECOND;

/**
 * Превращает адрес текущей страницы в адрес WebSocket.
 *
 * http:  -> ws:
 * https: -> wss:
 */
export function getWebSocketUrl(): string {
  const url = new URL(WS_PATH, window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';

  return url.toString();
}
