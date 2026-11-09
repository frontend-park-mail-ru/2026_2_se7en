export const GET_CHATS_URL = '/chats';

export const chatUrl = (id: string): string => `${GET_CHATS_URL}/${encodeURIComponent(id)}`;

export const chatMessagesUrl = (id: string): string => `${chatUrl(id)}/messages`;

export const chatMembersUrl = (id: string): string => `${chatUrl(id)}/members`;
