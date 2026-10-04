export const ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  NICKNAME_TAKEN: 'NICKNAME_TAKEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Неверная почта или пароль',
  [ERROR_CODES.EMAIL_TAKEN]: 'Этот email уже используется',
  [ERROR_CODES.NICKNAME_TAKEN]: 'Этот никнейм уже занят',
  [ERROR_CODES.UNAUTHORIZED]: 'Сессия недействительна. Войдите снова',
  [ERROR_CODES.VALIDATION_ERROR]: 'Ошибка в данных. Проверьте форму',
  [ERROR_CODES.NETWORK_ERROR]: 'Нет подключения к интернету',
  [ERROR_CODES.INTERNAL_ERROR]: 'Сервис временно недоступен',
  [ERROR_CODES.UNKNOWN_ERROR]: 'Неизвестная ошибка',
};

export const ERROR_HINTS = {
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Проверьте данные и попробуйте ещё раз.',
  [ERROR_CODES.EMAIL_TAKEN]: 'Попробуйте войти или восстановить пароль.',
  [ERROR_CODES.NICKNAME_TAKEN]: 'Попробуйте другой никнейм.',
  [ERROR_CODES.UNAUTHORIZED]: 'Войдите заново, чтобы продолжить.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Проверьте правильность заполнения полей.',
  [ERROR_CODES.NETWORK_ERROR]: 'Проверьте Wi‑Fi или мобильную сеть и попробуйте ещё раз.',
  [ERROR_CODES.INTERNAL_ERROR]: 'Не удалось выполнить действие. Попробуйте позже.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'Попробуйте позже.',
};
