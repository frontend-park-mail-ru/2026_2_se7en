import { FieldErrorIcon } from '@/components/core/Icons.ts';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';

/**
 * Рендерит HTML-разметку текста ошибки под полем ввода.
 * Возвращает пустую строку, если ошибки нет.
 */
export function renderFieldError(error = ''): string {
  if (!error) return '';

  return `
    <p class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
      ${FieldErrorIcon}
      ${escapeHtml(error)}
    </p>`;
}
