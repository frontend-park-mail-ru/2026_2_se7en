/**
 * Форматирует дату последнего сообщения для строки списка чатов.
 * @param {Date|null} messageDate Дата последнего сообщения.
 * @returns {string} Локальное время или дата сообщения.
 */
export function formatMessageTime(messageDate) {
  if (!messageDate || Number.isNaN(messageDate.getTime())) return '';

  const now = new Date();
  const isSameDay = (left, right) =>
    left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();

  if (isSameDay(messageDate, now)) {
    return messageDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(messageDate, yesterday)) return 'вчера';

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDayStart = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate(),
  );
  const daysAgo = Math.round((todayStart - messageDayStart) / 86_400_000);

  if (daysAgo > 1 && daysAgo < 7) {
    return messageDate.toLocaleDateString('ru-RU', { weekday: 'short' });
  }

  return messageDate.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    ...(messageDate.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  });
}

/**
 * Подготавливает чат к отображению в списке.
 * @param {Object} chat Объект чата из API.
 * @returns {Object} Данные чата с полями для интерфейса.
 */
export function toDisplayChat(chat) {
  const initials = String(chat.name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const messageDate = chat.last_message?.created_at
    ? new Date(chat.last_message.created_at)
    : null;

  return {
    ...chat,
    initials,
    isOnline: false,
    time: formatMessageTime(messageDate),
    lastMessage: chat.last_message?.content || '',
    unreadCount: 0,
  };
}
