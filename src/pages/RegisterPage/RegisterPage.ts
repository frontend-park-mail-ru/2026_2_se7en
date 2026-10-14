import { STATUSES } from '@/constants/Statuses';
import { ELEMENT_IDS, VALIDATION_RULES } from './register.constants';
import { Page } from '@/pages/Page.js';
import { renderRegisterHeader } from '@/components/register/registerHeader.js';
import { renderRegisterForm } from '@/components/register/registerForm.js';
import { renderRegisterError } from '@/components/register/registerError.js';
import { validateForm } from '@/pages/RegisterPage/register.helpers.js';
import { AuthApi } from '@/api/auth/AuthApi.js';
import { ROUTES } from '@/constants/Routes.js';
import { showPage } from '@/helpers/ShowPage.js';
import { LoginPage } from '@/pages/LoginPage/LoginPage.js';
import { ApiError } from '@/api/ApiResponse';
import type { RegisterFormData, RegisterFieldErrors, RegisterField } from '@/api/auth/auth.types';

export class RegisterPage extends Page {
  static route = ROUTES.REGISTER;

  private fieldErrors: RegisterFieldErrors = {};
  private generalError: string | null = null;
  private isSubmitting = false;

  private formData: RegisterFormData = {
    first_name: '',
    nickname: '',
    email: '',
    password: '',
  };

  render(): string {
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

  rerender(): void {
    if (!this.container) return;

    this.container.innerHTML = this.render();
    this.bindEvents();
  }

  bindEvents(): void {
    document.getElementById(ELEMENT_IDS.FORM)?.addEventListener('submit', (event: SubmitEvent) => {
      void this.handleSubmit(event);
    });

    this.container
      ?.querySelector('[data-page-route="login"]')
      ?.addEventListener('click', (event: MouseEvent) => {
        event.preventDefault();
        void showPage(LoginPage);
      });

    (Object.keys(VALIDATION_RULES) as RegisterField[]).forEach((fieldName) => {
      const input = document.getElementById(fieldName);

      input?.addEventListener('input', () => {
        if (!(input instanceof HTMLInputElement)) return;

        this.formData[fieldName] = input.value;

        delete this.fieldErrors[fieldName];
        this.generalError = null;
      });
    });

    this.container
      ?.querySelector<HTMLElement>('[data-toggle-password]')
      ?.addEventListener('click', (event: MouseEvent) => {
        const button = event.currentTarget;

        if (!(button instanceof HTMLElement)) return;

        const inputId = button.dataset.togglePassword;

        if (!inputId) return;

        const input = document.getElementById(inputId);

        if (!(input instanceof HTMLInputElement)) return;

        const show = input.type === 'password';

        input.type = show ? 'text' : 'password';

        button.setAttribute('aria-label', show ? 'Скрыть пароль' : 'Показать пароль');

        button.setAttribute('aria-pressed', String(show));

        button.querySelector('[data-eye="open"]')?.classList.toggle('hidden', show);

        button.querySelector('[data-eye="closed"]')?.classList.toggle('hidden', !show);
      });
  }

  readForm(): void {
    (Object.keys(this.formData) as RegisterField[]).forEach((fieldName) => {
      const input = document.getElementById(fieldName);

      if (input instanceof HTMLInputElement) {
        this.formData[fieldName] = input.value;
      }
    });
  }

  async handleSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    if (this.isSubmitting) return;

    this.readForm();

    this.fieldErrors = {};
    this.generalError = null;

    const { isValid, fieldErrors } = validateForm((field) => {
      const fieldName = field as RegisterField;
      const value = this.formData[fieldName];

      return fieldName === 'password' ? value : value.trim();
    });

    if (!isValid) {
      this.fieldErrors = fieldErrors;
      this.rerender();
      return;
    }

    this.isSubmitting = true;

    const submitButton = document.getElementById(ELEMENT_IDS.SUBMIT_BUTTON);

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
      submitButton.textContent = 'Создание...';
    }

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

    if (result.status === STATUSES.CONFLICT && result instanceof ApiError) {
      if (result.code === 'EMAIL_TAKEN') {
        this.fieldErrors.email = 'email_already_exists';
      }

      if (result.code === 'NICKNAME_TAKEN') {
        this.fieldErrors.nickname = 'nickname_already_exists';
      }
    }

    if (Object.keys(this.fieldErrors).length === 0 && result instanceof ApiError) {
      this.generalError = result.message || 'Произошла ошибка при регистрации';
    }

    this.rerender();
  }
}
