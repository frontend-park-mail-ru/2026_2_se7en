import './Input.scss';
import { escapeHtml } from '@/helpers/EscapeHtml';
import { renderAttrs } from '@/helpers/RenderAttrs.ts';

type IconPosition = 'left' | 'right';

export interface InputParams {
  placeholder?: string;
  id?: string;
  name?: string;
  type?: string;
  value?: string;
  icon?: string;
  iconPosition?: IconPosition;
  className?: string;
  unstyled?: boolean;
  attrs?: Record<string, string>;
}

/**
 * Генерирует HTML-разметку для поля ввода.
 */
export function Input({
  placeholder = '',
  id,
  name,
  type = 'text',
  value = '',
  icon = '',
  iconPosition = 'left',
  className = '',
  unstyled = false,
  attrs = {},
}: InputParams): string {
  const idAttr = id ? `id="${id}"` : '';
  const nameAttr = name ? `name="${name}"` : '';
  const valueAttr = value ? `value="${escapeHtml(value)}"` : '';
  const attrsHtml = renderAttrs(attrs);

  if (unstyled) {
    return `<input type="${escapeHtml(type)}" ${idAttr} ${nameAttr} placeholder="${escapeHtml(placeholder)}" ${valueAttr} class="${escapeHtml(className)}" ${attrsHtml}>`;
  }

  const fieldClasses = `input__field${icon ? ` input__field_icon-${iconPosition}` : ''}`;

  const iconHtml = icon
    ? `
    <svg class="icon icon_md input__icon input__icon_${iconPosition}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      ${icon}
    </svg>
  `
    : '';

  return `
    <div class="input ${className}">
      ${iconPosition === 'left' ? iconHtml : ''}
      <input
        type="${type}"
        ${idAttr}
        ${nameAttr}
        placeholder="${escapeHtml(placeholder)}"
        ${valueAttr}
        class="${fieldClasses}"
        ${attrsHtml}
      >
      ${iconPosition === 'right' ? iconHtml : ''}
    </div>
  `;
}
