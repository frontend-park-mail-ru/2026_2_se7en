import { Input } from '../core/Input.js';
import { EyeClosedIcon, EyeOpenIcon } from '../core/Icons.js';
import { escapeHtml } from '../../helpers/escapeHtml.js';

const registerEyeIcons = `${EyeOpenIcon.replace('w-5 h-5 hidden', 'w-5 h-5')}${EyeClosedIcon.replace('w-5 h-5"', 'w-5 h-5 hidden"')}`;

/**
 * Универсальный компонент поля формы
 * @param {Object} params
 * @param {string} params.id - ID поля (используется для label и input)
 * @param {string} params.name - Атрибут name для input
 * @param {string} params.label - Текст лейбла
 * @param {string} params.type - Тип input (text, email, password, tel)
 * @param {string} params.placeholder - Placeholder
 * @param {string} params.value - Текущее значение
 * @param {string} [params.error] - Текст ошибки (если есть)
 * @param {string} [params.hint] - Подсказка после лейбла (например "необязательно")
 * @param {string} [params.description] - Подсказка под полем
 * @param {string} [params.className] - Дополнительные классы для input
 * @returns {string} HTML строка поля
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
}) {
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

  const inputWithToggle = type === 'password'
    ? `<div class="relative">
        ${inputHtml}
        <button type="button" data-toggle-password="${id}" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700" aria-label="Показать пароль" aria-pressed="false">
          ${registerEyeIcons}
        </button>
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
        <div>
            <label for="${id}" class="block text-xs font-medium ${labelColor} mb-1.5">
                ${label}${hintHtml}
            </label>
            ${inputWithToggle}
            ${description && !hasError ? `<p class="mt-1.5 text-xs text-gray-400">${escapeHtml(description)}</p>` : ''}
            ${errorHtml}
        </div>
    `;
}
