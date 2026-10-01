/**
 * Кастомный класс ошибки для API-запросов.
 * Сохраняет код ошибки и детали валидации с бэкенда.
 */
export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}
