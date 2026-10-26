import { Button } from '@/components/core/Button.js';
import { Input } from '@/components/core/Input.js';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';
import { EyeClosedIcon, EyeOpenIcon } from '@/components/core/Icons.js';

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

  const errorHtml = hasError
    ? `
        <p class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 22 22" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 flex-shrink-0 text-red-500">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            ${escapeHtml(error)}
        </p>`
    : '';

  return `
        <div data-form-field>
            <label for="${id}" class="block text-xs font-medium ${labelColor} mb-1.5">
                ${label}${hintHtml}
            </label>
            ${inputWithToggle}
            ${description && !hasError ? `<p class="mt-1.5 text-xs text-gray-400">${escapeHtml(description)}</p>` : ''}
            ${errorHtml}
        </div>
    `;
}
