export const WS_PATH = '/api/v1/ws';

export const WS_RECONNECT_BASE_DELAY_MS = 1000;
export const WS_RECONNECT_MAX_DELAY_MS = 30000;

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
