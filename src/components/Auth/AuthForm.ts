import './AuthForm.scss';
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
 */
export function renderAuthError(error = '', hint = ''): string {
  if (!error) return '';

  return `
    <div class="auth-form__alert">
      ${BannerErrorIcon}
      <div>
        <p class="auth-form__alert-title">${escapeHtml(error)}</p>
        ${hint ? `<p class="auth-form__alert-hint">${escapeHtml(hint)}</p>` : ''}
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
  <div class="auth-form">
    <div data-general-error-slot>${renderAuthError(generalError, generalErrorHint)}</div>

    <div class="auth-form__card">
      <h2 class="auth-form__title">${title}</h2>
      <p class="auth-form__subtitle">${subtitle}</p>

      <form id="${formId}" class="auth-form__form" novalidate>
        ${fieldsHtml}

        <div class="auth-form__submit-wrap">
          <button
            type="submit"
            id="${submitId}"
            ${loading ? 'disabled' : ''}
            class="submit-button"
          >
            ${loading ? `${SpinnerIcon} Проверяем данные...` : submitText}
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
