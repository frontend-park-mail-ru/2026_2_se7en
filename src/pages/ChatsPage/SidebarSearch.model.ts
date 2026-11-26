import { ApiError } from '@/api/ApiResponse.ts';
import { ChatsApi } from '@/api/chats/ChatsApi.ts';
import type { Contact } from '@/api/contacts/contacts.types.ts';
import { ContactsApi } from '@/api/contacts/ContactsApi.ts';
import type { GetChatsParams } from '@/api/chats/chats.types.ts';
import { ProfileApi } from '@/api/profile/ProfileApi.ts';
import type {
  SearchSection,
  SidebarSearchResults,
  SidebarSearchSection,
} from '@/components/chat/SidebarSearch.ts';
import { formatMessageTime, getChatInitials, toDisplayChat } from '@/helpers/chat.ts';

const pageSize = 20;

function emptyState(): SidebarSearchSection {
  return { items: [], loading: true, error: false, hasMore: false };
}

/** Загружает результаты одного поискового запроса и хранит позицию пагинации каждой секции. */
export class SidebarSearchModel {
  readonly results: SidebarSearchResults = {
    contacts: emptyState(),
    users: emptyState(),
    chats: emptyState(),
    messages: emptyState(),
  };
  readonly contacts = new Map<string, Contact>();
  private contactOffset = 0;
  private userOffset = 0;
  private chatCursor: Pick<GetChatsParams, 'after_time' | 'after_id'> = {};
  private messageCursor?: string;

  constructor(readonly query: string) {}

  async load(key: SearchSection): Promise<void> {
    const section = this.results[key];
    section.loading = true;
    section.error = false;

    try {
      if (key === 'contacts') {
        const response = await ContactsApi.getContacts({
          q: this.query,
          limit: pageSize,
          offset: this.contactOffset,
        });
        if (response instanceof ApiError) {
          section.error = true;
          return;
        }

        const contacts = response.data ?? [];
        for (const contact of contacts) {
          this.contacts.set(contact.contact_user_id, contact);
        }
        section.items.push(
          ...contacts.map((contact) => ({
            id: contact.contact_user_id,
            title:
              contact.pseudonym ||
              [contact.first_name, contact.last_name].filter(Boolean).join(' ') ||
              contact.nickname,
            description: '@' + contact.nickname,
          })),
        );
        this.contactOffset += contacts.length;
        section.hasMore = contacts.length === pageSize;
      } else if (key === 'users') {
        const response = await ProfileApi.searchUsers(this.query, pageSize, this.userOffset);
        if (response instanceof ApiError) {
          section.error = true;
          return;
        }

        const page = response.data;
        for (const user of page?.items ?? []) {
          const title =
            [user.first_name, user.last_name].filter(Boolean).join(' ') || user.nickname;
          section.items.push({
            id: user.user_id,
            title,
            description: '@' + user.nickname,
            profile: {
              userId: user.user_id,
              firstName: user.first_name,
              lastName: user.last_name,
              nickname: user.nickname,
              avatarUrl: user.icon_url,
              initials: getChatInitials(title),
              isContact: user.is_contact,
            },
          });
        }
        section.hasMore = page?.next_offset != null;
        if (page?.next_offset != null) this.userOffset = page.next_offset;
      } else if (key === 'chats') {
        const response = await ChatsApi.getChats({
          limit: pageSize,
          q: this.query,
          ...this.chatCursor,
        });
        if (response instanceof ApiError) {
          section.error = true;
          return;
        }

        const page = response.data;
        for (const item of page?.items ?? []) {
          if (item.id) {
            const chat = toDisplayChat(item);
            section.items.push({
              id: item.id,
              title: chat.name || 'Чат',
              description: chat.lastMessage,
            });
          }
        }
        this.chatCursor = { after_time: page?.next_after_time, after_id: page?.next_after_id };
        section.hasMore = Boolean(this.chatCursor.after_time && this.chatCursor.after_id);
      } else {
        const response = await ChatsApi.searchMessages(this.query, pageSize, this.messageCursor);
        if (response instanceof ApiError) {
          section.error = true;
          return;
        }

        const messages = response.data?.items ?? [];
        section.items.push(
          ...messages.map((message) => ({
            id: message.id,
            chatId: message.chat_id,
            title: message.chat_name || 'Сообщение',
            description: [message.content, formatMessageTime(new Date(message.created_at))]
              .filter(Boolean)
              .join(' · '),
          })),
        );
        this.messageCursor = messages[messages.length - 1]?.id;
        section.hasMore = messages.length === pageSize;
      }
    } finally {
      section.loading = false;
    }
  }
}
