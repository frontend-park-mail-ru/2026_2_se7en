import { ELEMENT_IDS, VALIDATION_RULES, ERROR_MESSAGES } from './register.constants.js';
import { APP_ID } from '../../constants/App.js';
import { debugError } from '../../helpers/error.js';

/**
 * Класс описывающий страницу регистрации
 * Отвечает за рендеринг разметки страницы, валидацию полей, взаимодействие с API регистрации
 */
export class PageRegister {
    constructor() {
        this.container = null;
        this.currentStep = 1;
        this.fieldErrors = {};
        this.generalError = null;
        this.formData = {
            first_name: '',
            last_name: '',
            nickname: '',
            phone_number: '',
            email: '',
            password: '',
        };
    }

    /**
     * Генерирует HTML-разметку страницы
     * @returns {string} HTML-строка с разметкой страницы
     */
    render() {
        return `
        <div class="min-h-screen flex bg-white">
            <div class="hidden lg:flex lg:w-1/2 bg-[#f5f9ff] p-12 flex-col">
                <div class="flex items-center gap-3">
                    <img src="../../public/pictures/icon.png" alt="Логотип" class="w-12 h-12 rounded-xl object-cover" />
                    <span class="text-2xl font-semibold text-gray-900">Связь</span>
                </div>

                <div class="flex-1 flex items-center">
                    <div class="max-w-md">
                        <h1 class="text-gray-900 mb-4">
                            Соберите свой круг общения
                        </h1>
                        <p class="text-gray-500 text-lg leading-relaxed">
                            Личный профиль помогает друзьям быстро узнать вас и начать разговор.
                        </p>
                    </div>
                </div>
            </div>

            <div class="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col">
                <div class="flex items-center justify-between mb-8">
                    <button id="back-button" class="flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors text-sm font-medium cursor-pointer bg-transparent border-none">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        ${this.currentStep === 2 ? 'Вернуться к шагу 1' : 'Вернуться ко входу'}
                    </button>
                    <span class="text-sm font-bold text-gray-900">Шаг ${this.currentStep} из 2</span>
                </div>

                <div class="flex-1 flex items-center justify-center">
                    <div class="w-full max-w-md relative">
                        ${this._renderErrorContainer()}
                        
                        <div class="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                            <h2 class="text-gray-900 mb-1">Создайте аккаунт</h2>
                            <p class="text-gray-500 text-sm mb-6">Заполните основные данные</p>

                            <form id="${ELEMENT_IDS.FORM}" class="space-y-4" novalidate>
                                ${this.currentStep === 1 ? this._renderStep1Fields() : this._renderStep2Fields()}
                                
                                <div class="pt-2">
                                    <button type="submit" id="${ELEMENT_IDS.SUBMIT_BUTTON}" 
                                        class="w-full bg-black text-white py-3.5 px-4 rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed">
                                        ${this.currentStep === 1 ? 'Продолжить' : 'Создать аккаунт'}
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
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    _renderStep1Fields() {
        return `
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="${ELEMENT_IDS.FIRST_NAME}" class="block text-xs font-medium text-gray-500 mb-1.5">Имя</label>
                    <input type="text" id="${ELEMENT_IDS.FIRST_NAME}" name="first_name" 
                        class="w-full px-4 py-3 bg-[#f5f9ff] border ${this._getErrorClass(ELEMENT_IDS.FIRST_NAME)} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        placeholder="Введите имя"
                        value="${this.formData.first_name || ''}" />
                    ${this._renderFieldError(ELEMENT_IDS.FIRST_NAME)}
                </div>
                <div>
                    <label for="${ELEMENT_IDS.LAST_NAME}" class="block text-xs font-medium text-gray-500 mb-1.5">Фамилия</label>
                    <input type="text" id="${ELEMENT_IDS.LAST_NAME}" name="last_name" 
                        class="w-full px-4 py-3 bg-[#f5f9ff] border ${this._getErrorClass(ELEMENT_IDS.LAST_NAME)} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        placeholder="Введите фамилию"
                        value="${this.formData.last_name || ''}" />
                    ${this._renderFieldError(ELEMENT_IDS.LAST_NAME)}
                </div>
            </div>
        `;
    }

    _renderStep2Fields() {
        return `
            <div class="space-y-4">
                <div>
                    <label for="${ELEMENT_IDS.NICKNAME}" class="block text-xs font-medium ${this.fieldErrors[ELEMENT_IDS.NICKNAME] ? 'text-red-500' : 'text-gray-500'} mb-1.5">Никнейм</label>
                    <input type="text" id="${ELEMENT_IDS.NICKNAME}" name="nickname" 
                        class="w-full px-4 py-3 bg-[#f5f9ff] border ${this._getErrorClass(ELEMENT_IDS.NICKNAME)} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        placeholder="@nickname"
                        value="${this.formData.nickname || ''}" />
                    ${this._renderFieldError(ELEMENT_IDS.NICKNAME)}
                </div>

                <div>
                    <label for="${ELEMENT_IDS.PHONE_NUMBER}" class="block text-xs font-medium ${this.fieldErrors[ELEMENT_IDS.PHONE_NUMBER] ? 'text-red-500' : 'text-gray-500'} mb-1.5">Телефон <span class="text-gray-400 font-normal">(необязательно)</span></label>
                    <input type="tel" id="${ELEMENT_IDS.PHONE_NUMBER}" name="phone_number" 
                        class="w-full px-4 py-3 bg-[#f5f9ff] border ${this._getErrorClass(ELEMENT_IDS.PHONE_NUMBER)} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        placeholder="+7 999 806 1092"
                        value="${this.formData.phone_number || ''}" />
                    ${this._renderFieldError(ELEMENT_IDS.PHONE_NUMBER)}
                </div>

                <div>
                    <label for="${ELEMENT_IDS.EMAIL}" class="block text-xs font-medium ${this.fieldErrors[ELEMENT_IDS.EMAIL] ? 'text-red-500' : 'text-gray-500'} mb-1.5">Электронная почта</label>
                    <input type="email" id="${ELEMENT_IDS.EMAIL}" name="email" 
                        class="w-full px-4 py-3 bg-[#f5f9ff] border ${this._getErrorClass(ELEMENT_IDS.EMAIL)} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        placeholder="name@example.com"
                        value="${this.formData.email || ''}" />
                    ${this._renderFieldError(ELEMENT_IDS.EMAIL)}
                </div>

                <div>
                    <label for="${ELEMENT_IDS.PASSWORD}" class="block text-xs font-medium ${this.fieldErrors[ELEMENT_IDS.PASSWORD] ? 'text-red-500' : 'text-gray-500'} mb-1.5">Пароль</label>
                    <input type="password" id="${ELEMENT_IDS.PASSWORD}" name="password" 
                        class="w-full px-4 py-3 bg-[#f5f9ff] border ${this._getErrorClass(ELEMENT_IDS.PASSWORD)} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        placeholder="password"
                        value="${this.formData.password || ''}" />
                    ${this._renderFieldError(ELEMENT_IDS.PASSWORD)}
                </div>
            </div>
        `;
    }

    _renderFieldError(fieldId) {
        const error = this.fieldErrors && this.fieldErrors[fieldId];
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

    _renderErrorContainer() {
        if (!this.generalError) return '';
        return `
            <div id="${ELEMENT_IDS.ERROR_CONTAINER}" class="absolute -top-8 left-0 right-0 z-10 bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg">
                <div class="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 flex-shrink-0 text-red-600">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <div>
                        <p class="text-red-800 text-sm font-medium">Не удалось отправить данные</p>
                        <p class="text-red-600 text-xs mt-0.5">Проверьте соединение и попробуйте ещё раз.</p>
                    </div>
                </div>
            </div>
        `;
    }

    _getErrorClass(fieldId) {
        return this.fieldErrors && this.fieldErrors[fieldId] ? 'border-red-500' : 'border-transparent';
    }

    /**
     * Инициализирует страницу
     */
    mount() {
        this.container = document.getElementById(APP_ID);
        if (!this.container) {
            debugError(`Элемент с id ${APP_ID} не найден`);
            return;
        }
        this.fieldErrors = {};
        this.generalError = null;
        this.currentStep = 1;
        this.formData = {
            first_name: '',
            last_name: '',
            nickname: '',
            phone_number: '',
            email: '',
            password: '',
        };
        this.container.innerHTML = this.render();
        this.bindEvents();
    }

    /**
     * Навешивает обработчики событий
     */
    bindEvents() {
        const form = document.getElementById(ELEMENT_IDS.FORM);
        form?.addEventListener('submit', (e) => this.handleSubmit(e));

        const backButton = document.getElementById('back-button');
        backButton?.addEventListener('click', () => {
            this.goToPreviousStep();
        });

        Object.keys(VALIDATION_RULES).forEach((fieldName) => {
            const input = document.getElementById(fieldName);
            input?.addEventListener('input', () => {
                this.clearFieldError(fieldName);
                if (this.formData.hasOwnProperty(fieldName)) {
                    this.formData[fieldName] = input.value;
                }
            });
        });
    }

    /**
     * Переключает на предыдущий шаг или делает редирект на вход
     */
    goToPreviousStep() {
        if (this.currentStep === 2) {
            this.currentStep = 1;
            this.fieldErrors = {};
            this.generalError = null;
            this.container.innerHTML = this.render();
            this.bindEvents();
        } else {
            window.location.href = '/login';
        }
    }

    /**
     * Валидирует поля формы
     * @returns {Object} Объект с флагом валидности и массивом ошибок
     */
    validateForm() {
        this.fieldErrors = {};
        const errors = [];

        const fieldsToValidate = this.currentStep === 1 
            ? ['first_name', 'last_name']
            : ['nickname', 'email', 'password', 'phone_number'];

        for (const field of fieldsToValidate) {
            const rules = VALIDATION_RULES[field];
            const input = document.getElementById(field);
            if (!input) continue;

            const value = input.value.trim();

            if (field === 'phone_number' && !value) {
                continue;
            }

            if (rules.required && !value) {
                this.fieldErrors[field] = 'required';
                errors.push({ field, reason: 'required' });
                continue;
            }

            if (value) {
                if (rules.minLength && value.length < rules.minLength) {
                    this.fieldErrors[field] = `length_must_be_${rules.minLength}_to_${rules.maxLength}`;
                    errors.push({ field, reason: `length_must_be_${rules.minLength}_to_${rules.maxLength}` });
                } else if (rules.maxLength && value.length > rules.maxLength) {
                    this.fieldErrors[field] = 'max_length_exceeded';
                    errors.push({ field, reason: 'max_length_exceeded' });
                } else if (rules.pattern && !rules.pattern.test(value)) {
                    this.fieldErrors[field] = 'invalid_format';
                    errors.push({ field, reason: 'invalid_format' });
                }
            }
        }

        return { isValid: errors.length === 0, errors };
    }

    /**
     * Отображает ошибки валидации
     * @param {Array} errors - массив объектов ошибок
     */
    displayErrors(errors) {
        errors.forEach(({ field, reason }) => {
            this.fieldErrors[field] = reason;
        });
        
        this.container.innerHTML = this.render();
        this.bindEvents();
    }

    /**
     * Скрывает сообщение об ошибке конкретного поля
     * @param {string} field - Имя поля (id элемента)
     */
    clearFieldError(field) {
        if (this.fieldErrors) {
            delete this.fieldErrors[field];
        }
        this.generalError = null;
    }

    /**
     * Показывает общую ошибку
     * @param {string} message - Текст ошибки
     */
    showGeneralError(message) {
        this.generalError = message;
        this.container.innerHTML = this.render();
        this.bindEvents();
    }

    /**
     * Собирает данные из формы
     * @returns {Object} Объект с данными для отправки на сервер
     */
    getFormData() {
        const data = {
            email: this.formData.email.trim(),
            password: this.formData.password,
            nickname: this.formData.nickname.trim(),
            first_name: this.formData.first_name.trim(),
            last_name: this.formData.last_name.trim(),
        };

        const phone = this.formData.phone_number?.trim();
        if (phone) {
            data.phone_number = phone;
        }

        return data;
    }

    /**
     * Обрабатывает отправку формы
     * @async
     * @param {Event} event - Событие отправки формы
     */
    async handleSubmit(event) {
        event.preventDefault();

        const { isValid, errors } = this.validateForm();
        if (!isValid) {
            this.displayErrors(errors);
            return;
        }

        if (this.currentStep === 1) {
            this.formData.first_name = document.getElementById(ELEMENT_IDS.FIRST_NAME).value.trim();
            this.formData.last_name = document.getElementById(ELEMENT_IDS.LAST_NAME).value.trim();
            
            this.currentStep = 2;
            this.fieldErrors = {};
            this.generalError = null;
            this.container.innerHTML = this.render();
            this.bindEvents();
            return;
        }

        this.formData.nickname = document.getElementById(ELEMENT_IDS.NICKNAME).value.trim();
        this.formData.phone_number = document.getElementById(ELEMENT_IDS.PHONE_NUMBER).value.trim();
        this.formData.email = document.getElementById(ELEMENT_IDS.EMAIL).value.trim();
        this.formData.password = document.getElementById(ELEMENT_IDS.PASSWORD).value;

        const submitBtn = document.getElementById(ELEMENT_IDS.SUBMIT_BUTTON);
        const originalText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Создание...';

        try {
            const response = await fetch('/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(this.getFormData()),
            });

            const data = await response.json();

            if (response.status === 201) {
                window.location.href = '/login';
                return;
            }

            if (response.status === 400 && data.code === 'VALIDATION_ERROR' && data.details) {
                this.displayErrors(data.details);
            } else if (response.status === 409) {
                if (data.code === 'EMAIL_TAKEN') {
                    this.fieldErrors.email = 'already_exists';
                    this.container.innerHTML = this.render();
                    this.bindEvents();
                } else if (data.code === 'NICKNAME_TAKEN') {
                    this.fieldErrors.nickname = 'already_exists';
                    this.container.innerHTML = this.render();
                    this.bindEvents();
                } else {
                    this.showGeneralError(data.message || 'Произошла ошибка');
                }
            } else {
                this.showGeneralError(data.message || 'Произошла ошибка при регистрации');
            }
        } catch (error) {
            debugError(error);
            this.showGeneralError('Не удалось отправить данные');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}
