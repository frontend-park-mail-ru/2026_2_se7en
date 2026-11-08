/**
 * Действия, которые клиент может отправить через WebSocket.
 *
 * Текстовое сообщение отправляется отдельным HTTP-запросом.
 * Через WebSocket отправляются подписки, статус набора текста
 * и отметка сообщения как прочитанного.
 */
export type WsClientAction =
  | {
      type: 'subscribe' | 'unsubscribe' | 'typing.start' | 'typing.stop';
      chat_id: string;
    }
  | {
      type: 'message.mark_read';
      chat_id: string;
      message_id: string;
    };

/**
 * Известные события, которые сервер отправляет клиенту.
 */
export type WsServerEventType =
  | 'subscribed'
  | 'unsubscribed'
  | 'chat.created'
  | 'chat.deleted'
  | 'member.added'
  | 'member.deleted'
  | 'typing.started'
  | 'typing.stopped'
  | 'message.created'
  | 'message.read'
  | 'error';

/**
 * Общая форма события от сервера.
 *
 * Пока payload имеет тип unknown: содержимое зависит от type.
 * Когда будем обрабатывать конкретное событие в модели страницы,
 * проверим и уточним его payload.
 */
export interface WsServerEvent {
  type: WsServerEventType | (string & {});
  payload?: unknown;
}

/**
 * Данные события message.created.
 * Поля соответствуют MessageResponse на бэкенде.
 */
export interface WsMessage {
  id: string;
  user_id: string;
  chat_id: string;
  reply_to_message_id?: string | null;
  sticker_id?: string | null;
  content?: string | null;
  is_edited: boolean;
  is_read: boolean;
  type: 'text' | 'sticker';
  created_at: string;
  updated_at: string;
}

/**
 * Данные событий, которые содержат только ID чата.
 */
export interface WsChatPayload {
  chat_id: string;
}

/**
 * Данные события message.read.
 */
export interface WsMessageReadPayload {
  chat_id: string;
  message_id: string;
  user_id: string;
}

/**
 * Данные события error.
 */
export interface WsErrorPayload {
  code: string;
}
