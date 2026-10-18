import { VALIDATION_CHARACTERS } from '@/constants/Validation.ts';

/**
 * Экранирует текст перед вставкой в HTML-разметку.
 */
export function escapeHtml(value: unknown): string {
  if (value == null || value == undefined) {
    return '';
  }
  return String(value).replace(/[&<>"']/g, (character) => VALIDATION_CHARACTERS[character]);
}
