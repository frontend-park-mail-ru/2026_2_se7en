import './RegisterPage.scss';
import { ApiError } from '@/api/ApiResponse.js';
import { AuthApi } from '@/api/auth/AuthApi.js';
import { LoginPage } from '@/pages/LoginPage/LoginPage.js';
import { Page } from '@/pages/Page.js';
import { ROUTES } from '@/constants/Routes.js';
import { STATUSES } from '@/constants/Statuses.js';
import { Signal } from '@/reactive/Signal';
import { renderRegisterError } from '@/components/register/registerError.js';
import { renderRegisterForm } from '@/components/register/registerForm.js';
import { renderRegisterHeader } from '@/components/register/registerHeader.js';
import { showPage } from '@/helpers/ShowPage.js';
import { validateForm } from '@/pages/RegisterPage/register.helpers.js';
import { ELEMENT_IDS, VALIDATION_RULES } from '@/pages/RegisterPage/register.constants.js';
import type {
  RegisterField,
  RegisterFieldErrors,
  RegisterFormData,
} from '@/api/auth/auth.types.js';

/**
 * Страница регистрации: форма создания аккаунта с клиентской валидацией.
 */
export class RegisterPage extends Page {
  static route = ROUTES.REGISTER;

  private fieldErrors = new Signal<RegisterFieldErrors>({});
  private generalError = new Signal<string | null>(null);
  private isSubmitting = new Signal<boolean>(false);

  private formData: RegisterFormData = {
    first_name: '',
    nickname: '',
    email: '',
    password: '',
  };

  constructor() {
    super();

    this.setSubscribers([this.fieldErrors, this.generalError, this.isSubmitting], () =>
      this.update(),
    );
  }

  render(): string {
    return `
      <div class="register-page">
        ${renderRegisterHeader()}
        <div class="register-page__main">
          <div class="register-page__content">
            <div class="register-page__form-box">
              ${renderRegisterError(this.generalError.value)}
              ${renderRegisterForm({
                formData: this.formData,
                fieldErrors: this.fieldErrors.value,
                isSubmitting: this.isSubmitting.value,
              })}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  update(): void {
    if (!this.container) return;

    this.container.innerHTML = this.render();
    this.bindEvents();
  }

  bindEvents(): void {
    document.getElementById(ELEMENT_IDS.FORM)?.addEventListener('submit', (event: SubmitEvent) => {
      void this.handleSubmit(event);
    });

    (Object.keys(VALIDATION_RULES) as RegisterField[]).forEach((fieldName) => {
      const input = document.getElementById(fieldName);

      input?.addEventListener('input', () => {
        if (!(input instanceof HTMLInputElement)) return;

        this.formData[fieldName] = input.value;

        if (fieldName in this.fieldErrors.value) {
          this.fieldErrors.value = Object.fromEntries(
            Object.entries(this.fieldErrors.value).filter(([key]) => key !== fieldName),
          );
        }

        if (this.generalError.value !== null) {
          this.generalError.value = null;
        }
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

        button.querySelector('[data-eye="open"]')?.classList.toggle('is-hidden', show);

        button.querySelector('[data-eye="closed"]')?.classList.toggle('is-hidden', !show);
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

    if (this.isSubmitting.value) return;

    this.readForm();

    this.fieldErrors.value = {};
    this.generalError.value = null;

    const { isValid, fieldErrors } = validateForm((field) => {
      const fieldName = field as RegisterField;
      const value = this.formData[fieldName];

      return fieldName === 'password' ? value : value.trim();
    });

    if (!isValid) {
      this.fieldErrors.value = fieldErrors;
      return;
    }

    this.isSubmitting.value = true;

    const result = await AuthApi.register({
      email: this.formData.email.trim().toLowerCase(),
      password: this.formData.password,
      nickname: this.formData.nickname.trim(),
      first_name: this.formData.first_name.trim(),
    });

    this.isSubmitting.value = false;

    if (result.success) {
      await showPage(LoginPage);
      return;
    }

    const nextErrors: RegisterFieldErrors = {};

    if (result.status === STATUSES.CONFLICT && result instanceof ApiError) {
      if (result.code === 'EMAIL_TAKEN') {
        nextErrors.email = 'email_already_exists';
      }

      if (result.code === 'NICKNAME_TAKEN') {
        nextErrors.nickname = 'nickname_already_exists';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      this.fieldErrors.value = nextErrors;
      return;
    }

    if (result instanceof ApiError) {
      this.generalError.value = result.message || 'Произошла ошибка при регистрации';
    }
  }
}
