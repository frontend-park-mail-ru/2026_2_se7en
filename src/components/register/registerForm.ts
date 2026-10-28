import './registerForm.scss';
import { Button } from '@/components/core/Button.js';
import { FormField } from './registerFormField.js';
import { REGISTER_FIELDS } from './registerFormFields.constants.js';
import { ROUTES } from '@/constants/Routes.js';
import { ELEMENT_IDS, ERROR_MESSAGES } from '@/pages/RegisterPage/register.constants.js';
import type { RegisterFieldErrors, RegisterFormData } from '@/api/auth/auth.types';

export interface RegisterFormParams {
  formData: RegisterFormData;
  fieldErrors: RegisterFieldErrors;
  isSubmitting: boolean;
}

/**
 * Компонент формы регистрации
 */
export function renderRegisterForm({
  formData,
  fieldErrors,
  isSubmitting,
}: RegisterFormParams): string {
  const getError = (fieldId: string): string => {
    const err = fieldErrors[fieldId as keyof RegisterFieldErrors];
    return err ? ERROR_MESSAGES[err] || err : '';
  };

  return `
        <div class="register-form__card">
            <h2 class="register-form__title">Создайте аккаунт</h2>
            <p class="register-form__subtitle">Заполните основные данные</p>

            <form id="${ELEMENT_IDS.FORM}" class="register-form__form" novalidate>
                <div class="register-form__fields">
                    ${REGISTER_FIELDS.map((field) =>
                      FormField({
                        ...field,
                        value: formData[field.name as keyof RegisterFormData] || '',
                        error: getError(field.id),
                      }),
                    ).join('')}
                </div>

                <div class="register-form__submit-wrap">
                    ${Button({
                      id: ELEMENT_IDS.SUBMIT_BUTTON,
                      text: isSubmitting ? 'Создание...' : 'Создать аккаунт',
                      mode: 'primary',
                      className: 'button--block button--submit',
                      type: 'submit',
                      disabled: isSubmitting,
                    })}
                </div>
                <div class="register-form__footer">
                    <p class="register-form__footer-text">
                        Уже есть аккаунт?
                        <a href="${ROUTES.LOGIN}" data-page-route="login" class="register-form__footer-link">Войти</a>
                    </p>
                </div>
            </form>
        </div>
    `;
}
