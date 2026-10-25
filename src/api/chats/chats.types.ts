export type ChatType = 'dialog' | 'group' | 'channel';
export type MessageType = 'text' | 'sticker';

/**
 * Предварительный просмотр последнего сообщения.
 */
export interface MessagePreview {
  id?: string;
  content?: string | null;
  type?: MessageType;
  created_at?: string;
}

/**
 * Чат в формате ответа backend.
 */
export interface Chat {
  id?: string;
  type?: ChatType;
  name?: string | null;
  description?: string | null;
  icon_url?: string | null;
  members_count?: number;
  last_message?: MessagePreview | null;
  created_at?: string;
}

/**
 * Ответ GET /api/v1/chats.
 */
export interface ChatsResponse {
  items: Chat[];
}

/**
 * Параметры GET /api/v1/chats.
 */
export interface GetChatsParams {
  limit?: number;
  offset?: number;
  type?: ChatType;
}

/**
 * Чат, подготовленный для отображения в интерфейсе.
 */
export interface DisplayChat extends Chat {
  initials: string;
  isOnline: boolean;
  time: string;
  lastMessage: string;
  unreadCount: number;
}

/**
 * Параметры одного сообщения.
 */
export interface Message {
  id: number;
  text: string;
  isOutgoing: boolean;
  time: string;
}
