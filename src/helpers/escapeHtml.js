import { VALIDATION_CHARACTERS } from '@/constants/Validation';

/**
 * Экранирует текст перед вставкой в HTML-разметку.
 * @param {unknown} value Значение для экранирования.
 * @returns {string} Экранированная строка.
 */
export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => VALIDATION_CHARACTERS[character]);
}
