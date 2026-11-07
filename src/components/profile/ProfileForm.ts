import './ProfileForm.scss';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/Input';
import { PROFILE_TEXTS } from '@/constants/Profile';
import type { ProfileFormParams } from './Profile.types';
import { ROUTES } from '@/constants/Routes';
import { escapeHtml } from '@/helpers/EscapeHtml';
import { renderFieldError } from '@/helpers/FieldError';
import { EyeClosedIcon, EyeOpenIcon } from '@/components/core/Icons';

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
      const passwordModifier = field.isPassword ? ' profile-field__input_password' : '';
      const inputClass = `profile-field__input${hasError ? ' profile-field__input_error' : ''}${passwordModifier}`;

      const hintHtml = field.hint
        ? `<span class="profile-field__hint">${escapeHtml(field.hint)}</span>`
        : '';

      const passwordToggle = field.isPassword
        ? Button({
            text: '',
            type: 'button',
            mode: 'ghost',
            className: 'profile-field__toggle',
            ariaLabel: 'Показать пароль',
            iconBefore: `${authEyeClosedIcon}${authEyeOpenIcon}`,
            attrs: { 'data-toggle-password': field.id },
          })
        : '';

      return `
        <div class="profile-field" data-form-field="${field.id}">
          <label for="${field.id}" class="${labelClass}">
            ${escapeHtml(field.label)} ${hintHtml}
          </label>
          <div class="profile-field__control">
            ${Input({
              type: field.type || 'text',
              id: field.id,
              name: field.name,
              value: field.value || '',
              className: inputClass,
            })}
            ${passwordToggle}
          </div>
          <div data-field-error>${renderFieldError(field.error || '', 'profile-field__error')}</div>
        </div>
      `;
    })
    .join('');

  return `
    <div class="profile-form">
      <div class="profile-form__fields">
        ${fieldsHtml}
      </div>

      <div class="profile-form__actions">
        <a
          href="${ROUTES.PROFILE_SECURITY}"
          class="button button_secondary profile-form__btn"
        >
          ${PROFILE_TEXTS.BTN_CANCEL}
        </a>
        ${Button({
          text: PROFILE_TEXTS.BTN_SAVE,
          type: 'button',
          mode: 'primary',
          className: 'profile-form__btn',
        })}
      </div>
    </div>
  `;
}
