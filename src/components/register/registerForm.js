import { ELEMENT_IDS, ERROR_MESSAGES } from '../../pages/register/register.constants.js';
import { Button } from '../Button.js';
import { FormField } from './registerFormField.js';

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

            <form id="${ELEMENT_IDS.FORM}" class="space-y-4" novalidate>
                ${currentStep === 1 ? renderStep1Fields(formData, getError) : renderStep2Fields(formData, getError)}
                
                <div class="pt-2">
                    ${Button({
                      id: ELEMENT_IDS.SUBMIT_BUTTON,
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
 * Генерирует HTML-разметку полей для первого шага регистрации.
 *
 * @param {Object} formData - Текущие данные формы.
 * @param {Function} getError - Функция, возвращающая текст ошибки для заданного ID поля.
 * @returns {string} HTML-строка с разметкой полей первого шага.
 */
function renderStep1Fields(formData, getError) {
  return `
        <div class="grid grid-cols-2 gap-4">
            ${FormField({
              id: ELEMENT_IDS.FIRST_NAME,
              name: 'first_name',
              label: 'Имя',
              placeholder: 'Введите имя',
              value: formData.first_name || '',
              error: getError(ELEMENT_IDS.FIRST_NAME),
            })}
            ${FormField({
              id: ELEMENT_IDS.LAST_NAME,
              name: 'last_name',
              label: 'Фамилия',
              placeholder: 'Введите фамилию',
              value: formData.last_name || '',
              error: getError(ELEMENT_IDS.LAST_NAME),
            })}
        </div>
    `;
}

/**
 * Генерирует HTML-разметку полей для второго шага регистрации.
 *
 * @param {Object} formData - Текущие данные формы.
 * @param {Function} getError - Функция, возвращающая текст ошибки для заданного ID поля.
 * @returns {string} HTML-строка с разметкой полей второго шага.
 */
function renderStep2Fields(formData, getError) {
  return `
        <div class="space-y-4">
            ${FormField({
              id: ELEMENT_IDS.NICKNAME,
              name: 'nickname',
              label: 'Никнейм',
              placeholder: 'nickname',
              value: formData.nickname || '',
              error: getError(ELEMENT_IDS.NICKNAME),
            })}

            ${FormField({
              id: ELEMENT_IDS.PHONE_NUMBER,
              name: 'phone_number',
              label: 'Телефон',
              type: 'tel',
              placeholder: '+7 999 806 1092',
              value: formData.phone_number || '',
              hint: 'необязательно',
              error: getError(ELEMENT_IDS.PHONE_NUMBER),
            })}

            ${FormField({
              id: ELEMENT_IDS.EMAIL,
              name: 'email',
              label: 'Электронная почта',
              type: 'email',
              placeholder: 'name@example.com',
              value: formData.email || '',
              error: getError(ELEMENT_IDS.EMAIL),
            })}

            ${FormField({
              id: ELEMENT_IDS.PASSWORD,
              name: 'password',
              label: 'Пароль',
              type: 'password',
              placeholder: 'password',
              value: formData.password || '',
              error: getError(ELEMENT_IDS.PASSWORD),
            })}
        </div>
    `;
}
