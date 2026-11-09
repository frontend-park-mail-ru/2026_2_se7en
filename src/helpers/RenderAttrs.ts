import { escapeHtml } from '@/helpers/EscapeHtml.ts';

/**
 * Превращает набор атрибутов в HTML-строку вида `name="value"`.
 */
export function renderAttrs(attrs: Record<string, string>): string {
  return Object.entries(attrs)
    .map(([name, value]) => `${name}="${escapeHtml(value)}"`)
    .join(' ');
}
