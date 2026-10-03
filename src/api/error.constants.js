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
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Неверный email или пароль',
  [ERROR_CODES.EMAIL_TAKEN]: 'Этот email уже используется',
  [ERROR_CODES.NICKNAME_TAKEN]: 'Этот никнейм уже занят',
  [ERROR_CODES.UNAUTHORIZED]: 'Сессия недействительна. Войдите снова',
  [ERROR_CODES.VALIDATION_ERROR]: 'Ошибка в данных. Проверьте форму',
  [ERROR_CODES.NETWORK_ERROR]: 'Нет подключения к интернету или сервер недоступен',
  [ERROR_CODES.INTERNAL_ERROR]: 'Что-то пошло не так. Попробуйте позже',
  [ERROR_CODES.UNKNOWN_ERROR]: 'Неизвестная ошибка',
};
