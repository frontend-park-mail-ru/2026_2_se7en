import type { Message } from '@/api/chats/chats.types.ts';

/** Настройки отображения области диалога. */
export interface ChatAreaOptions {
  messages?: Message[];
  messagesLoading?: boolean;
  messagesError?: string;
  sendError?: string;
  sending?: boolean;
  draft?: string;
  dateLabel?: string;
  hasMoreMessages?: boolean;
  typingLabel?: string;
  canEditGroup?: boolean;
  canDeleteGroup?: boolean;
  menuOpen?: boolean;
  deleteConfirmOpen?: boolean;
}

/** Доступные фильтры списка чатов. */
export type ChatFilter = 'all' | 'unread' | 'dialog' | 'group';
