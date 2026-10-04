import { ELEMENT_IDS, ERROR_MESSAGES } from '../../pages/RegisterPage/register.constants.js';
import { ROUTES } from '../../constants/Routes.js';
import { Button } from '../core/Button.js';
import { FormField } from './registerFormField.js';
import { REGISTER_FIELDS } from './registerFormFields.constants.js';

/**
 * Компонент формы регистрации
 * @param {Object} options - параметры формы
 * @param {Object} options.formData - данные формы
 * @param {Object} options.fieldErrors - ошибки полей
 */
export function renderRegisterForm({ formData, fieldErrors }) {
  const getError = (fieldId) => {
    const err = fieldErrors[fieldId];
    return err ? ERROR_MESSAGES[err] || err : '';
  };

  return `
        <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h2 class="text-gray-900 mb-1 font-bold text-[32px] leading-[120%] tracking-[-0.5px]">Создайте аккаунт</h2>
            <p class="text-gray-500 text-sm mb-6">Заполните основные данные</p>

            <form id="${ELEMENT_IDS.FORM}" class="space-y-4" novalidate>
                <div class="space-y-4">
                    ${REGISTER_FIELDS.map((field) =>
                      FormField({
                        ...field,
                        value: formData[field.name] || '',
                        error: getError(field.id),
                      }),
                    ).join('')}
                </div>

                <div class="pt-2">
                    ${Button({
                      id: ELEMENT_IDS.SUBMIT_BUTTON,
                      text: 'Создать аккаунт',
                      mode: 'primary',
                      className:
                        'w-full py-3.5 px-4 disabled:bg-gray-300 disabled:cursor-not-allowed',
                      type: 'submit',
                    })}
                </div>
                <div class="text-center mt-4">
                    <p class="text-gray-500 text-sm">
                        Уже есть аккаунт?
                        <a href="${ROUTES.LOGIN}" data-page-route="login" class="font-semibold text-gray-900 hover:underline">Войти</a>
                    </p>
                </div>
            </form>
        </div>
    `;
}
