import { Button } from '@/components/core/Button.js';
import { Input } from '@/components/core/Input.js';
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

const authEyeClosedIcon = EyeClosedIcon.replace('class="w-5 h-5"', 'class="w-5 h-5 hidden"');
const authEyeOpenIcon = EyeOpenIcon.replace('class="w-5 h-5 hidden"', 'class="w-5 h-5"');

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
  const labelClass = error ? 'text-red-500' : 'text-gray-500';
  const borderClass = error ? 'border-red-500' : 'border-transparent';

  const inputHtml = Input({
    id,
    name,
    type,
    placeholder: escapeHtml(placeholder),
    value: escapeHtml(value),
    inputClassName: `w-full px-4 py-3 ${isPassword ? 'pr-12' : ''} bg-[#f5f9ff] border ${borderClass} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all`,
  });

  const passwordToggle = isPassword
    ? Button({
        text: '',
        type: 'button',
        mode: 'ghost',
        ariaLabel: 'Показать пароль',
        iconBefore: `${authEyeClosedIcon}${authEyeOpenIcon}`,
        attrs: { 'data-toggle-password': id },
        className: 'absolute right-3 top-1/2 -translate-y-1/2',
      })
    : '';

  const errorHtml = error
    ? `
    <p class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
      ${FieldErrorIcon}
      ${escapeHtml(error)}
    </p>
  `
    : '';

  return `
  <div>
    <label for="${id}" class="block text-xs font-medium ${labelClass} mb-1.5">
      ${escapeHtml(label)}
    </label>
    <div class="relative">
      ${inputHtml}
      ${passwordToggle}
    </div>
    ${errorHtml}
  </div>
  `;
}
