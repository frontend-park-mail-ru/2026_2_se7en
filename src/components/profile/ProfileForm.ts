import './ProfileForm.scss';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/Input';
import type { ProfileFormParams } from './profile.types';
import { ROUTES } from '@/constants/Routes';
import { Textarea } from '@/components/core/Textarea';
import { escapeHtml } from '@/helpers/EscapeHtml';
import { renderFieldError } from '@/helpers/FieldError';
import { BannerErrorIcon, EyeClosedIcon, EyeOpenIcon } from '@/components/core/Icons';
import { PROFILE_FORM_ID, PROFILE_SUBMIT_ID, PROFILE_TEXTS } from '@/constants/Profile';

const authEyeClosedIcon = EyeClosedIcon.replace(
  'class="icon icon_md"',
  'class="icon icon_md is-hidden"',
);
const authEyeOpenIcon = EyeOpenIcon.replace(
  'class="icon icon_md is-hidden"',
  'class="icon icon_md"',
);

/**
 * Рендерит баннер общей ошибки над формой редактирования профиля.
 */
export function renderProfileFormError(error?: string | null): string {
  if (!error) return '';

  return `
    <div class="profile-page__error profile-form__alert" role="alert">
      ${BannerErrorIcon}
      <p>${escapeHtml(error)}</p>
    </div>
  `;
}

/**
 * Универсальная форма профиля.
 */
export function ProfileForm({
  fields,
  cancelHref = ROUTES.PROFILE_SECURITY,
  isSubmitting = false,
  formError = null,
}: ProfileFormParams): string {
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
            ${
              field.multiline
                ? Textarea({
                    id: field.id,
                    name: field.name,
                    value: field.value || '',
                    className: inputClass,
                  })
                : Input({
                    type: field.type || 'text',
                    id: field.id,
                    name: field.name,
                    value: field.value || '',
                    className: inputClass,
                  })
            }
            ${passwordToggle}
          </div>
          <div data-field-error>${renderFieldError(field.error || '', 'profile-field__error')}</div>
        </div>
      `;
    })
    .join('');

  return `
    <form id="${PROFILE_FORM_ID}" class="profile-form" novalidate>
      <div data-form-error-slot>${renderProfileFormError(formError)}</div>

      <div class="profile-form__fields">
        ${fieldsHtml}
      </div>

      <div class="profile-form__actions">
        <a
          href="${cancelHref}"
          class="button button_secondary profile-form__btn"
        >
          ${PROFILE_TEXTS.BTN_CANCEL}
        </a>
        ${Button({
          id: PROFILE_SUBMIT_ID,
          text: isSubmitting ? PROFILE_TEXTS.BTN_SAVING : PROFILE_TEXTS.BTN_SAVE,
          type: 'submit',
          mode: 'primary',
          disabled: isSubmitting,
          className: 'profile-form__btn button_submit',
        })}
      </div>
    </form>
  `;
}
