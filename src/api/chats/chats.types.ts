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
  is_online?: boolean;
  unread_count?: number;
  members_count?: number;
  last_message?: MessagePreview | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Ответ GET /api/v1/chats.
 */
export interface ChatsResponse {
  items: Chat[];
  next_after_time?: string;
  next_after_id?: string;
}

/**
 * Параметры GET /api/v1/chats.
 */
export interface GetChatsParams {
  limit?: number;
  offset?: number;
  after_time?: string;
  after_id?: string;
  type?: ChatType;
}

export interface ChatDetailResponse {
  chat: Chat;
  role: 'creator' | 'admin' | 'member';
}

export interface ChatMember {
  user_id: string;
  role: 'creator' | 'admin' | 'member';
  is_online?: boolean;
  profile: {
    id: string;
    user_id: string;
    nickname: string;
    first_name: string;
    last_name?: string | null;
    bio?: string | null;
    icon_id?: string | null;
    icon_url?: string | null;
  };
}

export interface ListMembersResponse {
  items: ChatMember[];
}

export interface ChatMessage {
  id: string;
  user_id: string;
  chat_id: string;
  content?: string | null;
  type: MessageType;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListMessagesResponse {
  items: ChatMessage[];
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  members: string[];
}

export interface UpdateGroupRequest {
  name: string;
  description: string | null;
  set_description: true;
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
  id: string | number;
  text: string;
  isOutgoing: boolean;
  isRead?: boolean;
  time: string;
}
