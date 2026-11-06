import './ProfileForm.scss';
import { Button } from '@/components/core/Button';
import { EyeClosedIcon, EyeOpenIcon } from '@/components/core/Icons';
import { renderFieldError } from '@/helpers/FieldError';
import { escapeHtml } from '@/helpers/EscapeHtml';

export interface FormFieldParams {
  id: string;
  name: string;
  label: string;
  type?: string;
  value?: string;
  hint?: string;
  error?: string;
  isPassword?: boolean;
}

export interface ProfileFormParams {
  fields: FormFieldParams[];
  isSubmitting?: boolean;
  globalError?: string | null;
}

export function ProfileForm({
  fields,
  isSubmitting = false,
  globalError = null,
}: ProfileFormParams): string {
  const fieldsHtml = fields
    .map((field) => {
      const hasError = Boolean(field.error);
      const labelClass = `profile-field__label${hasError ? ' profile-field__label_error' : ''}`;
      const inputClass = `profile-field__input${hasError ? ' profile-field__input_error' : ''}`;

      const hintHtml = field.hint
        ? `<span class="profile-field__hint">${escapeHtml(field.hint)}</span>`
        : '';

      const authEyeClosedIcon = EyeClosedIcon.replace(
        'class="icon icon_md"',
        'class="icon icon_md is-hidden"',
      );
      const authEyeOpenIcon = EyeOpenIcon.replace(
        'class="icon icon_md is-hidden"',
        'class="icon icon_md"',
      );

      const passwordToggle = field.isPassword
        ? `<button type="button" data-toggle-password="${field.id}" class="profile-field__toggle" aria-label="Показать пароль">
             ${authEyeClosedIcon}
             ${authEyeOpenIcon}
           </button>`
        : '';

      return `
        <div class="profile-field" data-form-field="${field.id}">
          <label for="${field.id}" class="${labelClass}">
            ${escapeHtml(field.label)} ${hintHtml}
          </label>
          <div class="profile-field__control">
            <input
              type="${field.type || 'text'}"
              id="${field.id}"
              name="${field.name}"
              value="${escapeHtml(field.value || '')}"
              class="${inputClass}"
            />
            ${passwordToggle}
          </div>
          <div data-field-error>${renderFieldError(field.error || '', 'profile-field__error')}</div>
        </div>
      `;
    })
    .join('');

  const globalErrorHtml = globalError
    ? `
      <div class="profile-form__alert">
        <div class="profile-form__alert-title">${escapeHtml(globalError)}</div>
      </div>
    `
    : '';

  return `
    <div class="profile-form">
      ${globalErrorHtml}
      <form id="profile-form" novalidate>
        <div class="profile-form__fields">
          ${fieldsHtml}
        </div>

        <div class="profile-form__actions">
          <button type="button" id="profile-cancel-btn" class="button button_secondary profile-form__btn">
            Отмена
          </button>
          ${Button({
            text: isSubmitting ? 'Сохранение...' : 'Сохранить',
            type: 'submit',
            mode: 'primary',
            disabled: isSubmitting,
            className: 'profile-form__btn',
          })}
        </div>
      </form>
    </div>
  `;
}
