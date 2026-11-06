import './ProfileForm.scss';
import { Button } from '@/components/core/Button';
import { EyeClosedIcon, EyeOpenIcon } from '@/components/core/Icons';
import { renderFieldError } from '@/helpers/FieldError';
import { escapeHtml } from '@/helpers/EscapeHtml';
import { PROFILE_TEXTS } from '@/constants/Profile';
import type { ProfileFormParams } from './profile.types';

const authEyeClosedIcon = EyeClosedIcon.replace(
  'class="icon icon_md"',
  'class="icon icon_md is-hidden"',
);
const authEyeOpenIcon = EyeOpenIcon.replace(
  'class="icon icon_md is-hidden"',
  'class="icon icon_md"',
);

/**
 * Универсальная форма профиля.
 */
export function ProfileForm({ fields }: ProfileFormParams): string {
  const fieldsHtml = fields
    .map((field) => {
      const hasError = Boolean(field.error);
      const labelClass = `profile-field__label${hasError ? ' profile-field__label_error' : ''}`;
      const inputClass = `profile-field__input${hasError ? ' profile-field__input_error' : ''}`;

      const hintHtml = field.hint
        ? `<span class="profile-field__hint">${escapeHtml(field.hint)}</span>`
        : '';

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

  return `
    <div class="profile-form">
      <form id="profile-form" novalidate>
        <div class="profile-form__fields">
          ${fieldsHtml}
        </div>

        <div class="profile-form__actions">
          ${Button({
            id: 'profile-cancel-btn',
            text: PROFILE_TEXTS.BTN_CANCEL,
            type: 'button',
            mode: 'secondary',
            className: 'profile-form__btn',
          })}
          ${Button({
            text: PROFILE_TEXTS.BTN_SAVE,
            type: 'submit',
            mode: 'primary',
            className: 'profile-form__btn',
          })}
        </div>
      </form>
    </div>
  `;
}
