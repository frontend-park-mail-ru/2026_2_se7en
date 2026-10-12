export interface ChatMessage {
  id: number;
  text: string;
  isOutgoing: boolean;
  time: string;
}

export interface Chat {
  id: number;
  name: string;
  initials: string;
  isOnline: boolean;
  time: string;
  lastMessage: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface ChatsResponse {
  items: Chat[];
  total: number;
}

export interface GetChatsParams {
  limit?: number;
  offset?: number;
}
