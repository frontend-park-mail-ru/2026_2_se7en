import { ELEMENT_IDS, VALIDATION_RULES, ERROR_STATUSES } from './register.constants.js';

import { Page } from '../page.js';
import { renderRegisterHeader } from '../../components/register/registerHeader.js';
import { renderRegisterNavigation } from '../../components/register/registerNavigation.js';
import { renderRegisterForm } from '../../components/register/registerForm.js';
import { renderRegisterError } from '../../components/register/registerError.js';
import { validateForm } from './register.helpers.js';
import { AuthApi } from '../../api/auth/AuthApi.js';

/**
 * Класс описывающий страницу регистрации
 * Отвечает за рендеринг разметки страницы, валидацию полей, взаимодействие с API регистрации
 */
export class PageRegister extends Page {
  constructor() {
    super();
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
                          fieldErrors: this.fieldErrors,
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
        if (Object.prototype.hasOwnProperty.call(this.formData, fieldName)) {
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
  validate() {
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

    const { isValid, errors } = this.validate();
    if (!isValid) {
      this.displayErrors(errors);
      return;
    }

    if (this.currentStep === 1) {
      const fieldsToSave = [ELEMENT_IDS.FIRST_NAME, ELEMENT_IDS.LAST_NAME];
      fieldsToSave.forEach((fieldId) => {
        const input = document.getElementById(fieldId);
        if (input) {
          this.formData[fieldId] = input.value.trim();
        }
      });

      this.currentStep = 2;
      this.fieldErrors = {};
      this.generalError = null;
      this.container.innerHTML = this.render();
      this.bindEvents();
      return;
    }

    const fieldsToSave = [
      ELEMENT_IDS.NICKNAME,
      ELEMENT_IDS.PHONE_NUMBER,
      ELEMENT_IDS.EMAIL,
      ELEMENT_IDS.PASSWORD,
    ];

    fieldsToSave.forEach((fieldId) => {
      const input = document.getElementById(fieldId);
      if (input) {
        this.formData[fieldId] = input.value.trim();
      }
    });

    const submitBtn = document.getElementById(ELEMENT_IDS.SUBMIT_BUTTON);
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Создание...';

    const result = await AuthApi.register(this.getFormData());

    if (result.success) {
      window.location.href = '/login';
      return;
    }

    if (result.status === ERROR_STATUSES.STATUS_BAD_REQUEST && result.code === 'VALIDATION_ERROR') {
      this.displayErrors(result.details);
    } else if (result.status === ERROR_STATUSES.STATUS_CONFLICT) {
      if (result.code === 'EMAIL_TAKEN') {
        this.fieldErrors.email = 'already_exists';
      }
      if (result.code === 'NICKNAME_TAKEN') {
        this.fieldErrors.nickname = 'already_exists';
      }

      this.container.innerHTML = this.render();
      this.bindEvents();
    } else {
      this.showGeneralError(result.message || 'Произошла ошибка при регистрации');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}
