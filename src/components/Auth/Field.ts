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
  const passwordToggle = isPassword
    ? `
    <button
      type="button"
      data-toggle-password="${id}"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
      aria-label="Показать пароль"
    >
      ${authEyeClosedIcon}
      ${authEyeOpenIcon}
    </button>
  `
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
      <input
        type="${type}"
        id="${id}"
        name="${name}"
        placeholder="${escapeHtml(placeholder)}"
        value="${escapeHtml(value)}"
        class="w-full px-4 py-3 ${isPassword ? 'pr-12' : ''} bg-[#f5f9ff] border ${borderClass} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
      />
      ${passwordToggle}
    </div>
    ${errorHtml}
  </div>
  `;
}
