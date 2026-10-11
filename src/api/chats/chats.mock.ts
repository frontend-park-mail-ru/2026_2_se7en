import { ApiSuccess, ApiError, type ApiResult } from '@/api/ApiResponse.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@/api/error.constants.ts';
import { STATUSES } from '@/constants/Statuses.ts';
import type { ChatsResponse } from '@/api/chats/chats.types.ts';

export const MOCK_CHATS = [
  {
    id: 1,
    name: 'Алексей Смирнов',
    initials: 'АС',
    isOnline: true,
    time: '14:32',
    lastMessage: 'Привет! Как дела? Давно не виделись',
    unreadCount: 2,
    messages: [
      { id: 1, text: 'Привет!', isOutgoing: false, time: '14:30' },
      { id: 2, text: 'Как дела? Давно не виделись', isOutgoing: false, time: '14:32' },
    ],
  },
  {
    id: 2,
    name: 'Мария Иванова',
    initials: 'МИ',
    isOnline: false,
    time: 'вчера',
    lastMessage: 'Спасибо за помощь с проектом!',
    unreadCount: 0,
    messages: [
      { id: 1, text: 'Привет, можешь помочь с кодом?', isOutgoing: false, time: '10:15' },
      { id: 2, text: 'Конечно, что нужно?', isOutgoing: true, time: '10:20' },
      { id: 3, text: 'Спасибо за помощь с проектом!', isOutgoing: false, time: '15:45' },
    ],
  },
  {
    id: 3,
    name: 'Команда разработки',
    initials: 'КР',
    isOnline: true,
    time: '12:05',
    lastMessage: 'Дмитрий: Митинг в 15:00, не забудьте',
    unreadCount: 5,
    messages: [
      { id: 1, text: 'Всем привет!', isOutgoing: false, time: '09:00' },
      { id: 2, text: 'Митинг в 15:00, не забудьте', isOutgoing: false, time: '12:05' },
    ],
  },
  {
    id: 4,
    name: 'Елена Петрова',
    initials: 'ЕП',
    isOnline: true,
    time: '11:20',
    lastMessage: 'Отправила тебе файлы на почту',
    unreadCount: 1,
    messages: [{ id: 1, text: 'Отправила тебе файлы на почту', isOutgoing: false, time: '11:20' }],
  },
  {
    id: 5,
    name: 'Игорь Козлов',
    initials: 'ИК',
    isOnline: false,
    time: 'пн',
    lastMessage: 'Хорошо, договорились!',
    unreadCount: 0,
    messages: [
      { id: 1, text: 'Встретимся в понедельник?', isOutgoing: true, time: '16:30' },
      { id: 2, text: 'Хорошо, договорились!', isOutgoing: false, time: '16:45' },
    ],
  },
];

export async function mockGetChats({
  limit = 20,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
} = {}): Promise<ApiResult<ChatsResponse>> {
  await new Promise<void>((resolve) => setTimeout(resolve, 500));

  try {
    const paginatedChats = MOCK_CHATS.slice(offset, offset + limit);

    const data: ChatsResponse = {
      items: paginatedChats,
      total: MOCK_CHATS.length,
    };

    return new ApiSuccess<ChatsResponse>(data, STATUSES.OK);
  } catch {
    return new ApiError(
      ERROR_CODES.INTERNAL_ERROR,
      ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
      STATUSES.INTERNAL_SERVER_ERROR,
    );
  }
}
