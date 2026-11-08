import {
  WS_RECONNECT_BASE_DELAY_MS,
  WS_RECONNECT_MAX_DELAY_MS,
  getWebSocketUrl,
} from './ws.constants.ts';
import type { WsClientAction, WsServerEvent } from './ws.types.ts';

type EventHandler = (event: WsServerEvent) => void;
type ErrorHandler = (error: Event | Error) => void;
type ConnectedHandler = (reconnected: boolean) => void;

export class WebSocketApi {
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private reconnectAttempt = 0;
  private hasConnected = false;
  private stopped = true;
  private readonly subscriptions = new Set<string>();

  constructor(
    private readonly onEvent: EventHandler,
    private readonly onError: ErrorHandler,
    private readonly onConnected?: ConnectedHandler,
  ) {}

  connect(): void {
    this.stopped = false;

    if (
      this.socket?.readyState === WebSocket.OPEN ||
      this.socket?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    try {
      const socket = new WebSocket(getWebSocketUrl());
      this.socket = socket;

      socket.addEventListener('open', () => {
        if (this.socket !== socket) return;

        const reconnected = this.hasConnected || this.reconnectAttempt > 0;
        this.hasConnected = true;
        this.reconnectAttempt = 0;

        for (const chatId of this.subscriptions) {
          this.send({ type: 'subscribe', chat_id: chatId });
        }

        this.onConnected?.(reconnected);
      });

      socket.addEventListener('message', (event: MessageEvent) => {
        if (this.socket !== socket || typeof event.data !== 'string') {
          return;
        }

        try {
          const parsed: unknown = JSON.parse(event.data);
          if (
            !parsed ||
            typeof parsed !== 'object' ||
            !('type' in parsed) ||
            typeof parsed.type !== 'string'
          ) {
            return;
          }

          this.onEvent(parsed as WsServerEvent);
        } catch (error) {
          this.onError?.(error instanceof Error ? error : new Error('Invalid WebSocket event'));
        }
      });

      socket.addEventListener('error', (event) => {
        if (this.socket === socket) this.onError?.(event);
      });

      socket.addEventListener('close', () => {
        if (this.socket !== socket) return;

        this.socket = null;
        if (!this.stopped) this.scheduleReconnect();
      });
    } catch (error) {
      this.onError?.(error instanceof Error ? error : new Error('WebSocket connection failed'));
      this.scheduleReconnect();
    }
  }
  subscribe(chatId: string): void {
    if (this.subscriptions.has(chatId)) return;

    this.subscriptions.add(chatId);
    this.send({ type: 'subscribe', chat_id: chatId });
  }

  unsubscribe(chatId: string): void {
    if (!this.subscriptions.delete(chatId)) return;

    this.send({ type: 'unsubscribe', chat_id: chatId });
  }

  send(action: WsClientAction): boolean {
    if (this.socket?.readyState !== WebSocket.OPEN) return false;

    this.socket.send(JSON.stringify(action));
    return true;
  }

  disconnect(): void {
    this.stopped = true;
    this.hasConnected = false;

    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    const socket = this.socket;
    this.socket = null;
    socket?.close();
    this.subscriptions.clear();
  }

  private scheduleReconnect(): void {
    if (this.stopped || this.reconnectTimer != null) return;

    const delay = Math.min(
      WS_RECONNECT_BASE_DELAY_MS * 2 ** this.reconnectAttempt,
      WS_RECONNECT_MAX_DELAY_MS,
    );

    this.reconnectAttempt += 1;

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }
}
