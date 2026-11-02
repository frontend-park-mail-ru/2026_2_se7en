import './registerFormField.scss';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';
import { EyeClosedIcon, EyeOpenIcon } from '@/components/core/Icons.js';

const registerEyeIcons = `${EyeOpenIcon.replace(
  'class="icon icon_md is-hidden"',
  'class="icon icon_md"',
)}${EyeClosedIcon.replace('class="icon icon_md"', 'class="icon icon_md is-hidden"')}`;

export interface FormFieldParams {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder: string;
  value?: string;
  error?: string;
  hint?: string;
  description?: string;
  className?: string;
}

/**
 * Универсальный компонент поля формы
 * @returns HTML строка поля
 */
export function FormField({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  value = '',
  error = '',
  hint = '',
  description = '',
  className = '',
}: FormFieldParams): string {
  const hasError = !!error;
  const labelClass = `register-field__label${hasError ? ' register-field__label_error' : ''}`;
  const inputClass = `register-field__input${hasError ? ' register-field__input_error' : ''}`;
  const passwordModifier = type === 'password' ? 'register-field__input_password' : '';
  const hintHtml = hint ? ` <span class="register-field__hint">(${hint})</span>` : '';

  const inputHtml = `
    <input
      type="${type}"
      id="${id}"
      name="${name}"
      placeholder="${escapeHtml(placeholder)}"
      value="${escapeHtml(value)}"
      class="${inputClass} ${passwordModifier} ${className}"
    />
  `;

  const inputWithToggle =
    type === 'password'
      ? `<div class="register-field__control">
        ${inputHtml}
        <button type="button" data-toggle-password="${id}" class="register-field__toggle" aria-label="Показать пароль" aria-pressed="false">
          ${registerEyeIcons}
        </button>
      </div>`
      : inputHtml;

  const errorHtml = hasError
    ? `
        <p class="register-field__error">
            <svg fill="none" viewBox="0 0 22 22" stroke-width="1.5" stroke="currentColor" class="icon icon_sm icon_no-shrink icon_danger">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            ${escapeHtml(error)}
        </p>`
    : '';

  return `
        <div data-form-field>
            <label for="${id}" class="${labelClass}">
                ${label}${hintHtml}
            </label>
            ${inputWithToggle}
            ${description && !hasError ? `<p class="register-field__description">${escapeHtml(description)}</p>` : ''}
            ${errorHtml}
        </div>
    `;
}
