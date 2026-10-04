import { ELEMENT_IDS, VALIDATION_RULES, ERROR_STATUSES } from './register.constants.js';
import { Page } from '../Page.js';
import { renderRegisterHeader } from '../../components/register/registerHeader.js';
import { renderRegisterForm } from '../../components/register/registerForm.js';
import { renderRegisterError } from '../../components/register/registerError.js';
import { normalizeValidationReason, validateForm } from './register.helpers.js';
import { AuthApi } from '../../api/auth/AuthApi.js';
import { ROUTES } from '../../constants/Routes.js';
import { showPage } from '../../helpers/showPage.js';
import { LoginPage } from '../LoginPage/LoginPage.js';

/** Страница регистрации с одной формой для всех обязательных данных. */
export class RegisterPage extends Page {
  static route = ROUTES.REGISTER;

  constructor() {
    super();
    this.fieldErrors = {};
    this.generalError = null;
    this.isSubmitting = false;
    this.formData = {
      first_name: '',
      nickname: '',
      email: '',
      password: '',
    };
  }

  render() {
    return `
      <div class="min-h-screen flex bg-white">
        ${renderRegisterHeader()}
        <div class="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col">
          <div class="flex-1 flex items-center justify-center">
            <div class="w-full max-w-md relative">
              ${renderRegisterError(this.generalError)}
              ${renderRegisterForm({
                formData: this.formData,
                fieldErrors: this.fieldErrors,
              })}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  rerender() {
    this.container.innerHTML = this.render();
    this.bindEvents();
  }

  bindEvents() {
    document.getElementById(ELEMENT_IDS.FORM)?.addEventListener('submit', (event) => {
      this.handleSubmit(event);
    });

    this.container.querySelector('[data-page-route="login"]')?.addEventListener('click', (event) => {
      event.preventDefault();
      void showPage(LoginPage);
    });

    Object.keys(VALIDATION_RULES).forEach((fieldName) => {
      const input = document.getElementById(fieldName);
      input?.addEventListener('input', () => {
        this.formData[fieldName] = input.value;
        delete this.fieldErrors[fieldName];
        this.generalError = null;
      });
    });

    this.container.querySelector('[data-toggle-password]')?.addEventListener('click', (event) => {
      const button = event.currentTarget;
      const input = document.getElementById(button.dataset.togglePassword);
      if (!input) return;

      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.setAttribute('aria-label', show ? 'Скрыть пароль' : 'Показать пароль');
      button.setAttribute('aria-pressed', String(show));
      button.querySelector('[data-eye="open"]')?.classList.toggle('hidden', show);
      button.querySelector('[data-eye="closed"]')?.classList.toggle('hidden', !show);
    });
  }

  readForm() {
    Object.keys(this.formData).forEach((fieldName) => {
      const input = document.getElementById(fieldName);
      if (input) this.formData[fieldName] = input.value;
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    if (this.isSubmitting) return;

    this.readForm();
    this.fieldErrors = {};
    this.generalError = null;

    const { isValid, fieldErrors } = validateForm((field) => {
      const value = this.formData[field];
      return field === ELEMENT_IDS.PASSWORD ? value : value.trim();
    });
    if (!isValid) {
      this.fieldErrors = fieldErrors;
      this.rerender();
      return;
    }

    this.isSubmitting = true;
    const submitButton = document.getElementById(ELEMENT_IDS.SUBMIT_BUTTON);
    submitButton.disabled = true;
    submitButton.textContent = 'Создание...';

    const result = await AuthApi.register({
      email: this.formData.email.trim().toLowerCase(),
      password: this.formData.password,
      nickname: this.formData.nickname.trim(),
      first_name: this.formData.first_name.trim(),
    });

    this.isSubmitting = false;
    if (result.success) {
      await showPage(LoginPage);
      return;
    }

    if (result.status === ERROR_STATUSES.STATUS_BAD_REQUEST && Array.isArray(result.details)) {
      result.details.forEach(({ field, reason }) => {
        if (Object.hasOwn(this.formData, field)) {
          this.fieldErrors[field] = normalizeValidationReason(field, reason);
        }
      });
    } else if (result.status === ERROR_STATUSES.STATUS_CONFLICT) {
      if (result.code === 'EMAIL_TAKEN') this.fieldErrors.email = 'email_already_exists';
      if (result.code === 'NICKNAME_TAKEN') this.fieldErrors.nickname = 'nickname_already_exists';
    }

    if (Object.keys(this.fieldErrors).length === 0) {
      this.generalError = result.message || 'Произошла ошибка при регистрации';
    }
    this.rerender();
  }
}
