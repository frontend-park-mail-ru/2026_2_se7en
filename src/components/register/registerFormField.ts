import './registerFormField.scss';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';
import { EyeClosedIcon, EyeOpenIcon } from '@/components/core/Icons.ts';
import { renderFieldError } from '@/helpers/FieldError.ts';

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

  const descriptionHtml = description
    ? `<p data-field-description class="register-field__description${hasError ? ' is-hidden' : ''}">${escapeHtml(description)}</p>`
    : '';

  return `
        <div data-form-field="${id}">
            <label for="${id}" class="${labelClass}">
                ${label}${hintHtml}
            </label>
            ${inputWithToggle}
            ${descriptionHtml}
            <div data-field-error>${renderFieldError(error, 'register-field__error')}</div>
        </div>
    `;
}
