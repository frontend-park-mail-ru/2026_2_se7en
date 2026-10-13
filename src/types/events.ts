/**
 * Карта всех событий приложения.
 *
 * Каждый ключ — имя события, значение — тип payload'а.
 * Для событий без данных используем `void`, при эмите передаётся `undefined`.
 *
 * Чтобы добавить новое событие — допиши строчку сюда.
 * После этого TS подскажет имя события в `emit`/`on` и проверит payload.
 */
export type EventMap = {
  /** Пользователь успешно вошёл в аккаунт. */
  'user:login': { id: string; name: string };

  /** Пользователь нажал «Выйти». */
  'user:logout': void;

  /** Сервер вернул 401 — сессия истекла, нужен редирект на логин. */
  'auth:unauthorized': void;

  /** Показать всплывающее уведомление. */
  'snackbar:show': { text: string; type: 'success' | 'error' | 'info' };
};

/** Имя любого события. */
export type EventName = keyof EventMap;

/** Колбэк-подписчик. Принимает payload, соответствующий событию. */
export type EventListener<K extends EventName> = (payload: EventMap[K]) => void;
