import { Button } from '@/components/core/Button.js';
import { Input } from '@/components/core/Input.js';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';
import { EyeClosedIcon, EyeOpenIcon, FieldErrorIcon } from '@/components/core/Icons.js';
import { renderFieldError } from '@/helpers/FieldError.ts';

const registerEyeIcons = `${EyeOpenIcon.replace('w-5 h-5 hidden', 'w-5 h-5')}${EyeClosedIcon.replace('w-5 h-5"', 'w-5 h-5 hidden"')}`;

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
  const borderColor = hasError ? 'border-red-500' : 'border-transparent';
  const labelColor = hasError ? 'text-red-500' : 'text-gray-500';
  const hintHtml = hint ? ` <span class="text-gray-400 font-normal">(${hint})</span>` : '';
  const inputHtml = Input({
    id,
    name,
    type,
    placeholder,
    value: escapeHtml(value),
    inputClassName: `w-full px-4 py-3 ${type === 'password' ? 'pr-12' : ''} bg-[#f5faff] border ${borderColor} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all ${className}`,
  });

  const inputWithToggle =
    type === 'password'
      ? `<div class="relative">
        ${inputHtml}
        ${Button({
          text: '',
          type: 'button',
          mode: 'ghost',
          ariaLabel: 'Показать пароль',
          iconBefore: registerEyeIcons,
          attrs: { 'data-toggle-password': id, 'aria-pressed': 'false' },
          className: 'absolute right-3 top-1/2 -translate-y-1/2',
        })}
      </div>`
      : inputHtml;

  const descriptionHtml = description
    ? `<p data-field-description class="mt-1.5 text-xs text-gray-400 ${hasError ? 'hidden' : ''}">${escapeHtml(description)}</p>`
    : '';

  return `
        <div data-form-field="${id}">
            <label for="${id}" class="block text-xs font-medium ${labelColor} mb-1.5">
                ${label}${hintHtml}
            </label>
            ${inputWithToggle}
            ${descriptionHtml}
            <div data-field-error>${renderFieldError(error)}</div>
        </div>
    `;
}
