import './Input.scss';

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
}: InputParams): string {
  const idAttr = id ? `id="${id}"` : '';
  const nameAttr = name ? `name="${name}"` : '';
  const valueAttr = value ? `value="${value}"` : '';

  const fieldModifier = icon
    ? iconPosition === 'left'
      ? 'input__field--icon-left'
      : 'input__field--icon-right'
    : '';
  const fieldClasses = `input__field ${fieldModifier}`.trim();

  const iconHtml = icon
    ? `
    <svg class="icon icon--md input__icon input__icon--${iconPosition}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        placeholder="${placeholder}"
        ${valueAttr}
        class="${fieldClasses}"
      >
      ${iconPosition === 'right' ? iconHtml : ''}
    </div>
  `;
}
