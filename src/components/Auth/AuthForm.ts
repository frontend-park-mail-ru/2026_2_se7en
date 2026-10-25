import type { Signal } from '@/reactive/Signal';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';
import { BannerErrorIcon, SpinnerIcon } from '@/components/core/Icons.js';
import { Field, type FieldParams } from './Field.js';

export interface AuthFormParams {
  formId: string;
  submitId: string;
  title: string;
  subtitle: string;
  fields: FieldParams[];
  submitText: string;
  footer: string;
  generalError: Signal<string>;
  generalErrorHint: Signal<string>;
  loading: Signal<boolean>;
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
  const isLoading = loading.value;
  const errorBanner = generalError.value
    ? `
    <div class="absolute bottom-full left-0 right-0 mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
      ${BannerErrorIcon}
      <div>
        <p class="text-red-800 text-sm font-medium">${escapeHtml(generalError.value)}</p>
        ${generalErrorHint.value ? `<p class="text-red-600 text-xs mt-0.5">${escapeHtml(generalErrorHint.value)}</p>` : ''}
      </div>
    </div>
  `
    : '';

  return `
  <div class="relative">
    ${errorBanner}

    <div class="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
      <h2 class="text-[32px] font-bold leading-[120%] tracking-[-0.5px] text-gray-900 mb-1">${title}</h2>
      <p class="text-gray-500 text-sm mb-6">${subtitle}</p>

      <form id="${formId}" class="flex flex-col gap-4" novalidate>
        ${fieldsHtml}

        <div class="pt-2">
          <button
            type="submit"
            id="${submitId}"
            ${isLoading ? 'disabled' : ''}
            class="w-full bg-black text-white py-3.5 px-4 rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            ${isLoading ? `${SpinnerIcon} Проверяем данные...` : submitText}
          </button>
        </div>

        <div class="text-center">
          <p class="text-gray-500 text-sm">${footer}</p>
        </div>
      </form>
    </div>
  </div>
  `;
}
