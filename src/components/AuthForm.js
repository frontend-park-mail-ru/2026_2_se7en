import Handlebars from 'handlebars';
import { Field } from './Field.js';
import { BannerErrorIcon, SpinnerIcon } from './Icons.js';

const template = Handlebars.compile(`
  <div class="relative">
    {{#if generalError}}
      <div class="absolute bottom-full left-0 right-0 mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
        ${BannerErrorIcon}
        <div>
          <p class="text-red-800 text-sm font-medium">{{generalError}}</p>
          {{#if generalErrorHint}}
            <p class="text-red-600 text-xs mt-0.5">{{generalErrorHint}}</p>
          {{/if}}
        </div>
      </div>
    {{/if}}

    <div class="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
      <h2 class="text-[32px] font-bold leading-[120%] tracking-[-0.5px] text-gray-900 mb-1">{{title}}</h2>
      <p class="text-gray-500 text-sm mb-6">{{subtitle}}</p>

      <form id="{{formId}}" class="space-y-4" novalidate>
        {{{fieldsHtml}}}

        <div class="pt-2">
          <button
            type="submit"
            id="{{submitId}}"
            {{#if loading}}disabled{{/if}}
            class="w-full bg-black text-white py-3.5 px-4 rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {{#if loading}}
              ${SpinnerIcon}
              Проверяем данные...
            {{else}}
              {{submitText}}
            {{/if}}
          </button>
        </div>

        <div class="text-center mt-4">
          <p class="text-gray-500 text-sm">{{{footer}}}</p>
        </div>
      </form>
    </div>
  </div>
`);

/**
 * Генерирует HTML-разметку карточки формы авторизации.
 * Внутри рендерит массив полей через компонент Field.
 *
 * @param {Object} params
 * @param {string} params.formId - id формы (для навешивания submit).
 * @param {string} params.submitId - id кнопки отправки.
 * @param {string} params.title - Заголовок карточки.
 * @param {string} params.subtitle - Подпись под заголовком.
 * @param {Array<Object>} params.fields - Массив параметров для Field.
 * @param {string} params.submitText - Текст на кнопке.
 * @param {string} params.footer - HTML в нижней части карточки.
 * @param {string} [params.generalError=''] - Заголовок баннера ошибки.
 * @param {string} [params.generalErrorHint=''] - Подпись под заголовком баннера.
 * @param {boolean} [params.loading=false] - Флаг: идёт отправка формы.
 * @returns {string} HTML-строка с карточкой формы.
 */
export function AuthForm({
  formId,
  submitId,
  title,
  subtitle,
  fields,
  submitText,
  footer,
  generalError = '',
  generalErrorHint = '',
  loading = false,
}) {
  const fieldsHtml = fields.map((f) => Field(f)).join('');
  return template({
    formId,
    submitId,
    title,
    subtitle,
    fieldsHtml,
    submitText,
    footer,
    generalError,
    generalErrorHint,
    loading,
  });
}
