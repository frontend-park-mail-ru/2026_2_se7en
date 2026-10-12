import type { Chat, DisplayChat } from '@/api/chats/chats.types.ts';

/**
 * Форматирует дату последнего сообщения.
 */
export function formatMessageTime(messageDate: Date | null): string {
  if (!messageDate || Number.isNaN(messageDate.getTime())) {
    return '';
  }

  const now = new Date();

  const isSameDay = (left: Date, right: Date): boolean =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

  if (isSameDay(messageDate, now)) {
    return messageDate.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(messageDate, yesterday)) {
    return 'вчера';
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const startOfMessageDay = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate(),
  );

  const daysAgo = Math.floor((startOfToday.getTime() - startOfMessageDay.getTime()) / 86_400_000);

  if (daysAgo > 1 && daysAgo < 7) {
    return messageDate.toLocaleDateString('ru-RU', {
      weekday: 'short',
    });
  }

  return messageDate.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    ...(messageDate.getFullYear() !== now.getFullYear() ? { year: 'numeric' as const } : {}),
  });
}

/**
 * Преобразует чат из ответа backend в формат для UI.
 */
export function toDisplayChat(chat: Chat): DisplayChat {
  const name = chat.name ?? '';

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();

  const createdAt = chat.last_message?.created_at;

  const messageDate = createdAt ? new Date(createdAt) : null;

  return {
    ...chat,
    initials,
    isOnline: false,
    time: formatMessageTime(messageDate),
    lastMessage: chat.last_message?.content ?? '',
    unreadCount: 0,
  };
}
