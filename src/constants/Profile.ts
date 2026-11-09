import type { ProfileField } from '@/api/profile/profile.types';
import type { ProfileTab } from '@/components/profile/profile.types';

export const PROFILE_FORM_ID = 'profile-form';
export const PROFILE_SUBMIT_ID = 'profile-submit';

export const PROFILE_TEXTS = {
  TITLE_SECURITY: 'Аккаунт и безопасность',
  TITLE_PUBLIC: 'Профиль',
  TITLE_PHONE: 'Новый телефон',
  TITLE_PASSWORD: 'Новый пароль',
  TITLE_EMAIL: 'Новая почта',

  SUBTITLE_SECURITY: 'Аккаунт и безопасность',
  SUBTITLE_PUBLIC: 'Публичный профиль',

  MENU_PUBLIC: 'Публичный профиль',
  MENU_SECURITY: 'Аккаунт и безопасность',

  LABEL_EMAIL: 'Почта',
  LABEL_PHONE: 'Телефон',
  LABEL_PASSWORD: 'Пароль',
  LABEL_NAME: 'Имя',
  LABEL_SURNAME: 'Фамилия',
  LABEL_NICKNAME: 'Никнейм',
  LABEL_OLD_PASSWORD: 'Старый пароль',
  LABEL_NEW_PASSWORD: 'Новый пароль',
  LABEL_CONFIRM_PASSWORD: 'Подтвердите новый пароль',

  BTN_CHANGE: 'Изменить',
  BTN_CANCEL: 'Отмена',
  BTN_SAVE: 'Сохранить',
  BTN_SAVING: 'Сохранение...',

  PASSWORD_MASK: '•••••••••••',
  HINT_OPTIONAL: 'Необязательно',
  HINT_PASSWORD_LENGTH: '8–16 символов',
  FALLBACK_NAME: 'Пользователь',
} as const;

export const PROFILE_ERROR_MESSAGES: Record<string, string> = {
  required: 'Обязательное поле',
  first_name_length: 'Имя должно содержать от 2 до 32 символов',
  first_name_no_digits: 'Имя не должно содержать цифры',
  last_name_length: 'Фамилия должна содержать от 2 до 32 символов',
  last_name_no_digits: 'Фамилия не должна содержать цифры',
  nickname_length: 'Длина никнейма должна быть от 3 до 16 символов',
  nickname_invalid_format:
    'Можно использовать только латинские буквы, цифры и нижнее подчёркивание',
  nickname_already_exists: 'Такой никнейм уже используется',
  email_invalid_format: 'Введите почту в формате name@example.com',
  email_max_length: 'Электронная почта должна содержать не более 64 символов',
  email_already_exists: 'Такая электронная почта уже используется',
  phone_invalid_format: 'Введите номер в формате +79991234567 (от 10 до 15 цифр, без пробелов)',
  phone_already_exists: 'Такой номер телефона уже используется',
  password_length: 'Длина пароля должна быть от 8 до 16 символов',
  passwords_do_not_match: 'Пароли не совпадают',
  new_password_same_as_old: 'Новый пароль должен отличаться от старого',
  invalid_old_password: 'Неверный текущий пароль',
  contains_emoji: 'Поле не должно содержать смайлики или спецсимволы',
  contains_invalid_chars: 'Поле содержит недопустимые скрытые символы',
  invalid_format: 'Неверный формат',
};

/** Лимиты длины полей профиля (синхронизированы с бэкендом). */
export const PROFILE_LIMITS = {
  MAX_EMAIL_LENGTH: 64,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 32,
  MIN_NICKNAME_LENGTH: 3,
  MAX_NICKNAME_LENGTH: 16,
} as const;

/** Регулярные выражения для полей профиля. */
export const PROFILE_REGEXES = {
  NAME_NO_DIGITS: /^[^0-9]+$/,
  NICKNAME: /^[a-zA-Z0-9_]+$/,
  PHONE: /^\+?[1-9]\d{9,14}$/,
} as const;

/** Поля, относящиеся к каждой вкладке профиля. */
export const PROFILE_TAB_FIELDS: Record<Exclude<ProfileTab, 'security'>, ProfileField[]> = {
  public: ['first_name', 'last_name', 'nickname'],
  phone: ['phone'],
  email: ['email'],
  password: ['old_password', 'new_password', 'confirm_password'],
};
