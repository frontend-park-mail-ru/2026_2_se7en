import './AuthForm.scss';
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
    <div class="auth-form__alert">
      ${BannerErrorIcon}
      <div>
        <p class="auth-form__alert-title">${escapeHtml(generalError.value)}</p>
        ${generalErrorHint.value ? `<p class="auth-form__alert-hint">${escapeHtml(generalErrorHint.value)}</p>` : ''}
      </div>
    </div>
  `
    : '';

  return `
  <div class="auth-form">
    ${errorBanner}

    <div class="auth-form__card">
      <h2 class="auth-form__title">${title}</h2>
      <p class="auth-form__subtitle">${subtitle}</p>

      <form id="${formId}" class="auth-form__form" novalidate>
        ${fieldsHtml}

        <div class="auth-form__submit-wrap">
          <button
            type="submit"
            id="${submitId}"
            ${isLoading ? 'disabled' : ''}
            class="submit-button"
          >
            ${isLoading ? `${SpinnerIcon} Проверяем данные...` : submitText}
          </button>
        </div>

        <div class="auth-form__footer">
          <p class="auth-form__footer-text">${footer}</p>
        </div>
      </form>
    </div>
  </div>
  `;
}
