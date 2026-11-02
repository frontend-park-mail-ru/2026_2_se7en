import { Button } from '@/components/core/Button.ts';
import { BannerErrorIcon, SpinnerIcon } from '@/components/core/Icons.ts';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';
import { Field, type FieldParams } from './Field.ts';

export interface AuthFormParams {
  formId: string;
  submitId: string;
  title: string;
  subtitle: string;
  fields: FieldParams[];
  submitText: string;
  footer: string;
  generalError: string;
  generalErrorHint: string;
  loading: boolean;
}

/**
 * Рендерит баннер общей ошибки над формой.
 * Возвращает пустую строку, если ошибки нет.
 */
export function renderAuthError(error = '', hint = ''): string {
  if (!error) return '';

  return `
    <div class="absolute bottom-full left-0 right-0 mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
      ${BannerErrorIcon}
      <div>
        <p class="text-red-800 text-sm font-medium">${escapeHtml(error)}</p>
        ${hint ? `<p class="text-red-600 text-xs mt-0.5">${escapeHtml(hint)}</p>` : ''}
      </div>
    </div>
  `;
}

/**
 * Генерирует разметку карточки формы авторизации.
 */
export function AuthForm({
  formId,
  submitId,
  title,
  subtitle,
  fields,
  submitText,
  footer,
  generalError,
  generalErrorHint,
  loading,
}: AuthFormParams): string {
  const fieldsHtml = fields.map((field) => Field(field)).join('');

  return `
  <div class="relative">
    <div data-general-error-slot>${renderAuthError(generalError, generalErrorHint)}</div>

    <div class="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
      <h2 class="text-[32px] font-bold leading-[120%] tracking-[-0.5px] text-gray-900 mb-1">${title}</h2>
      <p class="text-gray-500 text-sm mb-6">${subtitle}</p>

      <form id="${formId}" class="flex flex-col gap-4" novalidate>
        ${fieldsHtml}

        <div class="pt-2">
          ${Button({
            id: submitId,
            text: loading ? 'Проверяем данные...' : submitText,
            iconBefore: loading ? SpinnerIcon : '',
            mode: 'primary',
            type: 'submit',
            disabled: loading,
            className:
              'w-full py-3.5 px-4 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed',
          })}
        </div>

        <div class="text-center">
          <p class="text-gray-500 text-sm">${footer}</p>
        </div>
      </form>
    </div>
  </div>
  `;
}
