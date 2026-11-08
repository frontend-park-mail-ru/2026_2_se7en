import type { ProfileField } from '@/api/profile/profile.types.ts';
import type { LoginField, RegisterField } from '@/api/auth/auth.types.ts';

/** Тип уведомления для Snackbar. */
export type SnackbarType = 'success' | 'error' | 'info';

/** Базовые события (глобальные). */
type BaseEvents = {
  /** Пользователь успешно вошёл в аккаунт. */
  'user:login': { id: string; name: string };

  /** Пользователь нажал «Выйти». */
  'user:logout': void;

  /** Сервер вернул 401 — сессия истекла, нужен редирект на логин. */
  'auth:unauthorized': void;

  /** Показать всплывающее уведомление. */
  'snackbar:show': { text: string; type: SnackbarType };
};

/** События страницы регистрации. */
type RegisterEvents = {
  /** View: пользователь нажал «Создать аккаунт». */
  'register:submit': void;

  /** View: пользователь ввёл текст в поле. */
  'register:field-change': { field: RegisterField; value: string };

  /** View: пользователь покинул поле (blur). */
  'register:field-blur': { field: RegisterField };

  /** Model: пользователь успешно зарегистрирован. */
  'register:success': void;
};

/** События страницы входа. */
type LoginEvents = {
  /** View: пользователь нажал «Войти». */
  'login:submit': void;

  /** View: пользователь ввёл текст в поле. */
  'login:field-change': { field: LoginField; value: string };

  /** Model: пользователь успешно вошёл. */
  'login:success': void;
};

/** События страницы чатов. */
type ChatsEvents = {
  /** View: загрузить или перезагрузить список чатов (initial load + retry). */
  'chats:load': void;

  /** View: пользователь выбрал чат. */
  'chats:select': { id: string };
};

/** События страницы профиля. */
type ProfileEvents = {
  /** View: отправка активной формы профиля. */
  'profile:submit': void;

  /** View: пользователь ввёл текст в поле профиля. */
  'profile:field-change': { field: ProfileField; value: string };

  /** View: пользователь покинул поле профиля. */
  'profile:field-blur': { field: ProfileField };
};

/** Общая карта всех событий приложения. */
export type EventMap = BaseEvents & RegisterEvents & LoginEvents & ChatsEvents & ProfileEvents;

/** Имя любого события. */
export type EventName = keyof EventMap;

/** Колбэк-подписчик. Принимает payload, соответствующий событию. */
export type EventListener<K extends EventName = EventName> = (payload: EventMap[K]) => void;
