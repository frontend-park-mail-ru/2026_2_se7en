import './Field.scss';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';
import { EyeClosedIcon, EyeOpenIcon, FieldErrorIcon } from '@/components/core/Icons.js';

export interface FieldParams {
  id: string;
  name: string;
  type?: string;
  label: string;
  placeholder?: string;
  value?: string;
  error?: string;
}

const authEyeClosedIcon = EyeClosedIcon.replace(
  'class="icon icon_md"',
  'class="icon icon_md is-hidden"',
);
const authEyeOpenIcon = EyeOpenIcon.replace(
  'class="icon icon_md is-hidden"',
  'class="icon icon_md"',
);

/**
 * Генерирует HTML-разметку поля ввода.
 */
export function Field({
  id,
  name,
  type = 'text',
  label,
  placeholder = '',
  value = '',
  error = '',
}: FieldParams): string {
  const isPassword = type === 'password';
  const labelClass = `field__label${error ? ' field__label_error' : ''}`;
  const inputClass = `field__input${error ? ' field__input_error' : ''}`;
  const passwordModifier = isPassword ? 'field__input_password' : '';
  const passwordToggle = isPassword
    ? `
    <button
      type="button"
      data-toggle-password="${id}"
      class="field__toggle"
      aria-label="Показать пароль"
    >
      ${authEyeClosedIcon}
      ${authEyeOpenIcon}
    </button>
  `
    : '';
  const errorHtml = error
    ? `
    <p class="field__error">
      ${FieldErrorIcon}
      ${escapeHtml(error)}
    </p>
  `
    : '';

  return `
  <div>
    <label for="${id}" class="${labelClass}">
      ${escapeHtml(label)}
    </label>
    <div class="field__control">
      <input
        type="${type}"
        id="${id}"
        name="${name}"
        placeholder="${escapeHtml(placeholder)}"
        value="${escapeHtml(value)}"
        class="${inputClass} ${passwordModifier}"
      />
      ${passwordToggle}
    </div>
    ${errorHtml}
  </div>
  `;
}
