/**
 * Универсальная функция для безопасного и форматированного вывода ошибок в консоль.
 *
 * @param {any} error - Объект ошибки (Error), строка или любое другое значение для логирования.
 */
export function debugError(error) {
  /* eslint-disable no-console */
  if (error instanceof Error) {
    console.error(error.message);
  } else if (typeof error === 'string') {
    console.error(error);
  } else {
    console.error('Неизвестная ошибка:', error);
  }
}
