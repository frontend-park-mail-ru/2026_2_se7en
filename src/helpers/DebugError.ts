/**
 * Безопасно выводит ошибку в консоль.
 */
export function debugError(error: unknown): void {
  if (error instanceof Error) {
    console.error(error.message);
  } else if (typeof error === 'string') {
    console.error(error);
  } else {
    console.error('Неизвестная ошибка:', error);
  }
}
