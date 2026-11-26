import type { Message } from '@/api/chats/chats.types.ts';
import type { PaginationState } from '@/helpers/PagedWindow.ts';

/** Настройки отображения области диалога. */
export interface ChatAreaOptions {
  searchQuery?: string;
  searchMessageId?: string;
  moreSearchResults?: boolean;
  messages?: Message[];
  messagesLoading?: boolean;
  messagesError?: string;
  sendError?: string;
  sending?: boolean;
  draft?: string;
  dateLabel?: string;
  messagePagination?: PaginationState;
  typingLabel?: string;
  peerUserId?: string;
  canEditGroup?: boolean;
  canDeleteGroup?: boolean;
  menuOpen?: boolean;
  deleteConfirmOpen?: boolean;
  deleteError?: string;
}

/** Доступные фильтры списка чатов. */
export type ChatFilter = 'all' | 'unread' | 'dialog' | 'group';

export interface ContactPreview {
  id: string;
  name: string;
  nickname: string;
  initials: string;
  avatarUrl?: string;
  online: boolean;
}

export interface ContactPickerView {
  loading?: boolean;
  error?: string;
}

export interface GroupMemberView {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  status: string;
  role?: 'creator' | 'admin' | 'member';
}

export interface GroupFormView {
  name?: string;
  description?: string;
  avatarUrl?: string;
  avatarFileName?: string;
  nameError?: string;
  descriptionError?: string;
  avatarError?: string;
  membersError?: string;
  submitError?: string;
  submitting?: boolean;
}

export interface GroupMembersView {
  loading?: boolean;
  error?: string;
  openMemberMenuId?: string | null;
  removeMemberId?: string | null;
  canManage?: boolean;
  canManageRoles?: boolean;
  canDeleteGroup?: boolean;
  leaveConfirmOpen?: boolean;
}
