import { ELEMENT_IDS, VALIDATION_RULES } from './register.constants.js';
import { debugError } from '../../helpers/error.js';

import { Page } from '../page.js';
import { renderRegisterHeader } from '../../components/register-header.js';
import { renderRegisterNavigation } from '../../components/register-navigation.js';
import { renderRegisterForm } from '../../components/register-form.js';
import { renderRegisterError } from '../../components/register-error.js';
import { validateForm } from './register.helpers.js';

/**
 * Класс описывающий страницу регистрации
 * Отвечает за рендеринг разметки страницы, валидацию полей, взаимодействие с API регистрации
 */
export class PageRegister extends Page {
    constructor() {
        super();
        this.container = null;
        this.resetFormState();
    }

    /**
     * Генерирует HTML-разметку страницы
     * @returns {string} HTML-строка с разметкой страницы
     */
    render() {
        return `
        <div class="min-h-screen flex bg-white">
            ${renderRegisterHeader()}

            <div class="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col">
                ${renderRegisterNavigation(this.currentStep)}

                <div class="flex-1 flex items-center justify-center">
                    <div class="w-full max-w-md relative">
                        ${renderRegisterError(this.generalError)}
                        
                        ${renderRegisterForm({
                            currentStep: this.currentStep,
                            formData: this.formData,
                            fieldErrors: this.fieldErrors
                        })}
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    /**
     * Сбрасывает всё состояние формы к начальным значениям
     */
    resetFormState() {
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
     * Инициализирует страницу
     */
    mount() {
        if (!super.mount()) {
            return false;
        }

        this.fieldErrors = {};
        this.generalError = null;
        this.currentStep = 1;
        this.resetFormState();
        this.container.innerHTML = this.render();
        this.bindEvents();
        return true;
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
            this.resetFormState();
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
        return validateForm(this.currentStep, (field) => {
            const input = document.getElementById(field);
            return input ? input.value.trim() : '';
        });
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
