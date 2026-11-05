import { FieldErrorIcon } from '@/components/core/Icons.ts';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';

/**
 * Рендерит HTML-разметку текста ошибки под полем ввода.
 *
 * @param error Текст ошибки. Пустая строка → пустой HTML.
 * @param className CSS-класс обёртки (разный для разных форм).
 */
export function renderFieldError(error = '', className = 'field__error'): string {
  if (!error) return '';

  return `
    <p class="${className}">
      ${FieldErrorIcon}
      ${escapeHtml(error)}
    </p>`;
}
