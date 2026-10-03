import { ELEMENT_IDS, ERROR_MESSAGES } from '../pages/register/register.constants.js';

/**
 * Компонент формы регистрации
 * @param {Object} options - параметры формы
 * @param {number} options.currentStep - текущий шаг
 * @param {Object} options.formData - данные формы
 * @param {Object} options.fieldErrors - ошибки полей
 */
export function renderRegisterForm({ currentStep, formData, fieldErrors }) {
    return `
        <div class="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h2 class="text-gray-900 mb-1 font-bold text-[32px] leading-[120%] tracking-[-0.5px]">Создайте аккаунт</h2>
                <p class="text-gray-500 text-sm mb-6">Заполните основные данные</p>

            <form id="${ELEMENT_IDS.FORM}" class="space-y-4" novalidate>
                ${currentStep === 1 ? renderStep1Fields(formData, fieldErrors) : renderStep2Fields(formData, fieldErrors)}
                
                <div class="pt-2">
                    <button type="submit" id="${ELEMENT_IDS.SUBMIT_BUTTON}" 
                        class="w-full bg-black text-white py-3.5 px-4 rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed">
                        ${currentStep === 1 ? 'Продолжить' : 'Создать аккаунт'}
                    </button>
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

function renderStep1Fields(formData, fieldErrors) {
    return `
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label for="${ELEMENT_IDS.FIRST_NAME}" class="block text-xs font-medium text-gray-500 mb-1.5">Имя</label>
                <input type="text" id="${ELEMENT_IDS.FIRST_NAME}" name="first_name" 
                    class="w-full px-4 py-3 bg-[#f5f9ff] border ${getErrorClass(fieldErrors, ELEMENT_IDS.FIRST_NAME)} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                    placeholder="Введите имя"
                    value="${formData.first_name || ''}" />
                ${renderFieldError(fieldErrors, ELEMENT_IDS.FIRST_NAME)}
            </div>
            <div>
                <label for="${ELEMENT_IDS.LAST_NAME}" class="block text-xs font-medium text-gray-500 mb-1.5">Фамилия</label>
                <input type="text" id="${ELEMENT_IDS.LAST_NAME}" name="last_name" 
                    class="w-full px-4 py-3 bg-[#f5f9ff] border ${getErrorClass(fieldErrors, ELEMENT_IDS.LAST_NAME)} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                    placeholder="Введите фамилию"
                    value="${formData.last_name || ''}" />
                ${renderFieldError(fieldErrors, ELEMENT_IDS.LAST_NAME)}
            </div>
        </div>
    `;
}

function renderStep2Fields(formData, fieldErrors) {
    return `
        <div class="space-y-4">
            <div>
                <label for="${ELEMENT_IDS.NICKNAME}" class="block text-xs font-medium ${fieldErrors[ELEMENT_IDS.NICKNAME] ? 'text-red-500' : 'text-gray-500'} mb-1.5">Никнейм</label>
                <input type="text" id="${ELEMENT_IDS.NICKNAME}" name="nickname" 
                    class="w-full px-4 py-3 bg-[#f5f9ff] border ${getErrorClass(fieldErrors, ELEMENT_IDS.NICKNAME)} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                    placeholder="nickname"
                    value="${formData.nickname || ''}" />
                ${renderFieldError(fieldErrors, ELEMENT_IDS.NICKNAME)}
            </div>

            <div>
                <label for="${ELEMENT_IDS.PHONE_NUMBER}" class="block text-xs font-medium ${fieldErrors[ELEMENT_IDS.PHONE_NUMBER] ? 'text-red-500' : 'text-gray-500'} mb-1.5">Телефон <span class="text-gray-400 font-normal">(необязательно)</span></label>
                <input type="tel" id="${ELEMENT_IDS.PHONE_NUMBER}" name="phone_number" 
                    class="w-full px-4 py-3 bg-[#f5f9ff] border ${getErrorClass(fieldErrors, ELEMENT_IDS.PHONE_NUMBER)} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                    placeholder="+7 999 806 1092"
                    value="${formData.phone_number || ''}" />
                ${renderFieldError(fieldErrors, ELEMENT_IDS.PHONE_NUMBER)}
            </div>

            <div>
                <label for="${ELEMENT_IDS.EMAIL}" class="block text-xs font-medium ${fieldErrors[ELEMENT_IDS.EMAIL] ? 'text-red-500' : 'text-gray-500'} mb-1.5">Электронная почта</label>
                <input type="email" id="${ELEMENT_IDS.EMAIL}" name="email" 
                    class="w-full px-4 py-3 bg-[#f5f9ff] border ${getErrorClass(fieldErrors, ELEMENT_IDS.EMAIL)} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                    placeholder="name@example.com"
                    value="${formData.email || ''}" />
                ${renderFieldError(fieldErrors, ELEMENT_IDS.EMAIL)}
            </div>

            <div>
                <label for="${ELEMENT_IDS.PASSWORD}" class="block text-xs font-medium ${fieldErrors[ELEMENT_IDS.PASSWORD] ? 'text-red-500' : 'text-gray-500'} mb-1.5">Пароль</label>
                <input type="password" id="${ELEMENT_IDS.PASSWORD}" name="password" 
                    class="w-full px-4 py-3 bg-[#f5f9ff] border ${getErrorClass(fieldErrors, ELEMENT_IDS.PASSWORD)} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                    placeholder="password"
                    value="${formData.password || ''}" />
                ${renderFieldError(fieldErrors, ELEMENT_IDS.PASSWORD)}
            </div>
        </div>
    `;
}

function renderFieldError(fieldErrors, fieldId) {
    const error = fieldErrors && fieldErrors[fieldId];
    if (!error) return '';
    const message = ERROR_MESSAGES[error] || error;
    return `
        <p class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 22 22" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 flex-shrink-0 text-red-500">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            ${message}
        </p>
    `;
}

function getErrorClass(fieldErrors, fieldId) {
    return fieldErrors && fieldErrors[fieldId] ? 'border-red-500' : 'border-transparent';
}
