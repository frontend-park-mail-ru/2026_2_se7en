import { ERROR_MESSAGES } from '../../pages/register/register.constants.js';
import { Button } from '../Button.js';
import { FormField } from './registerFormField.js';
import { STEP_1_FIELDS, STEP_2_FIELDS } from './registerFormFields.constants.js';

/**
 * Компонент формы регистрации
 * @param {Object} options - параметры формы
 * @param {number} options.currentStep - текущий шаг
 * @param {Object} options.formData - данные формы
 * @param {Object} options.fieldErrors - ошибки полей
 */
export function renderRegisterForm({ currentStep, formData, fieldErrors }) {
  const getError = (fieldId) => {
    const err = fieldErrors[fieldId];
    return err ? ERROR_MESSAGES[err] || err : '';
  };

  return `
        <div class="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h2 class="text-gray-900 mb-1 font-bold text-[32px] leading-[120%] tracking-[-0.5px]">Создайте аккаунт</h2>
            <p class="text-gray-500 text-sm mb-6">Заполните основные данные</p>

            <form id="register-form" class="space-y-4" novalidate>
                ${
                  currentStep === 1
                    ? renderFieldsGrid(formData, getError)
                    : renderFieldsList(formData, getError)
                }

                <div class="pt-2">
                    ${Button({
                      id: 'submit-button',
                      text: currentStep === 1 ? 'Продолжить' : 'Создать аккаунт',
                      mode: 'primary',
                      className:
                        'w-full py-3.5 px-4 disabled:bg-gray-300 disabled:cursor-not-allowed',
                      type: 'submit',
                    })}
                </div>

                <div class="text-center mt-4">
                    <p class="text-gray-500 text-sm">
                        Уже есть аккаунт?
                        <a href="/login" class="font-semibold text-gray-900 hover:underline">Войти</a>
                    </p>
                </div>
            </form>
        </div>
    `;
}

/**
 * Рендерит поля первого шага в сетке
 */
function renderFieldsGrid(formData, getError) {
  return `
        <div class="grid grid-cols-2 gap-4">
            ${STEP_1_FIELDS.map((field) =>
              FormField({
                ...field,
                value: formData[field.name] || '',
                error: getError(field.id),
              }),
            ).join('')}
        </div>
    `;
}

/**
 * Рендерит поля второго шага списком
 */
function renderFieldsList(formData, getError) {
  return `
        <div class="space-y-4">
            ${STEP_2_FIELDS.map((field) =>
              FormField({
                ...field,
                value: formData[field.name] || '',
                error: getError(field.id),
              }),
            ).join('')}
        </div>
    `;
}
