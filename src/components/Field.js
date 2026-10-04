import Handlebars from 'handlebars';
import { EyeClosedIcon, EyeOpenIcon, FieldErrorIcon } from './Icons.js';

const template = Handlebars.compile(`
  <div>
    <label for="{{id}}" class="block text-xs font-medium {{#if error}}text-red-500{{else}}text-gray-500{{/if}} mb-1.5">
      {{label}}
    </label>
    <div class="relative">
      <input
        type="{{type}}"
        id="{{id}}"
        name="{{name}}"
        placeholder="{{placeholder}}"
        value="{{value}}"
        class="w-full px-4 py-3 {{#if isPassword}}pr-12{{/if}} bg-[#f5f9ff] border {{#if error}}border-red-500{{else}}border-transparent{{/if}} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
      />
      {{#if isPassword}}
        <button
          type="button"
          data-toggle-password="{{id}}"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Показать пароль"
        >
          ${EyeClosedIcon}
          ${EyeOpenIcon}
        </button>
      {{/if}}
    </div>
    {{#if error}}
      <p class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
        ${FieldErrorIcon}
        {{error}}
      </p>
    {{/if}}
  </div>
`);

/**
 * Генерирует HTML-разметку для поля ввода с подписью, опциональной кнопкой показа пароля
 * и сообщением об ошибке.
 *
 * @param {Object} params
 * @param {string} params.id - Уникальный id поля.
 * @param {string} params.name - Атрибут name для формы.
 * @param {string} [params.type='text'] - Тип input (text, email, password, tel).
 * @param {string} params.label - Подпись над полем.
 * @param {string} [params.placeholder=''] - Подсказка внутри поля.
 * @param {string} [params.value=''] - Текущее значение.
 * @param {string} [params.error=''] - Текст ошибки под полем.
 * @returns {string} HTML-строка с разметкой поля.
 */
export function Field({
  id,
  name,
  type = 'text',
  label,
  placeholder = '',
  value = '',
  error = '',
}) {
  return template({
    id,
    name,
    type,
    label,
    placeholder,
    value,
    error,
    isPassword: type === 'password',
  });
}
