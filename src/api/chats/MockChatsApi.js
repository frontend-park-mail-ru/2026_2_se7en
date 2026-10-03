/**
 * Моковый API для тестирования.
 */
export class MockChatsApi {
  static async getChats({ limit = 20, offset = 0 } = {}) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const allChats = [
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
        messages: [
          { id: 1, text: 'Отправила тебе файлы на почту', isOutgoing: false, time: '11:20' },
        ],
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

    const paginatedChats = allChats.slice(offset, offset + limit);

    return {
      items: paginatedChats,
      total: allChats.length,
    };
  }
}
