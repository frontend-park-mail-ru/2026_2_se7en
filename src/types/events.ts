/** Тип уведомления для Snackbar */
export type SnackbarType = 'success' | 'error' | 'info';

export type EventMap = {
  /** Пользователь успешно вошёл в аккаунт. */
  'user:login': { id: string; name: string };

  /** Пользователь нажал «Выйти». */
  'user:logout': void;

  /** Сервер вернул 401 — сессия истекла, нужен редирект на логин. */
  'auth:unauthorized': void;

  /** Показать всплывающее уведомление. */
  'snackbar:show': { text: string; type: SnackbarType };
};

/** Имя любого события. */
export type EventName = keyof EventMap;

/** Колбэк-подписчик. Принимает payload, соответствующий событию. */
export type EventListener<K extends EventName = EventName> = (payload: EventMap[K]) => void;
