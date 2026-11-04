import './RegisterPage.scss';
import { ApiError } from '@/api/ApiResponse.js';
import { AuthApi } from '@/api/auth/AuthApi.js';
import { LoginPage } from '@/pages/LoginPage/LoginPage.js';
import { Page } from '@/pages/Page.js';
import { ROUTES } from '@/constants/Routes.js';
import { STATUSES } from '@/constants/Statuses.js';
import { Signal } from '@/reactive/Signal';
import type { ValidationReason } from '@/pages/RegisterPage/register.types.js';
import { escapeHtml } from '@/helpers/EscapeHtml.js';
import { renderRegisterError } from '@/components/register/registerError.js';
import { renderRegisterForm } from '@/components/register/registerForm.js';
import { renderRegisterHeader } from '@/components/register/registerHeader.js';
import { showPage } from '@/helpers/ShowPage.js';
import {
  ELEMENT_IDS,
  ERROR_MESSAGES,
  VALIDATION_RULES,
} from '@/pages/RegisterPage/register.constants.js';
import type {
  RegisterField,
  RegisterFieldErrors,
  RegisterFormData,
} from '@/api/auth/auth.types.js';
import { validateForm, validateSingleField } from '@/pages/RegisterPage/register.helpers.js';

/**
 * Страница регистрации: форма создания аккаунта с клиентской валидацией.
 */
export class RegisterPage extends Page {
  static route = ROUTES.REGISTER;

  private fieldErrors = new Signal<RegisterFieldErrors>({});
  private generalError = new Signal<string | null>(null);
  private isSubmitting = new Signal<boolean>(false);

  private touchedFields = new Set<RegisterField>();
  private submitAttempted = false;

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
        this.validateFieldLive(fieldName);

        if (this.generalError.value !== null) {
          this.generalError.value = null;
        }
      });

      input?.addEventListener('blur', () => {
        if (!(input instanceof HTMLInputElement)) return;

        this.formData[fieldName] = input.value;
        this.touchedFields.add(fieldName);
        this.validateFieldLive(fieldName);
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

  private getFieldValue(field: RegisterField): string {
    const value = this.formData[field];
    return field === 'password' ? value : value.trim();
  }

  private validateFieldLive(field: RegisterField): void {
    if (!this.touchedFields.has(field) && !this.submitAttempted) return;

    const reason: ValidationReason | null = validateSingleField(field, this.getFieldValue(field));
    this.setFieldErrorDom(field, reason ? ERROR_MESSAGES[reason] || reason : '');
  }

  /**
   * Обновляет/убирает сообщение об ошибке под конкретным полем
   * без перерендера всей формы.
   */
  private setFieldErrorDom(field: RegisterField, message: string): void {
    const input = document.getElementById(field);

    if (!(input instanceof HTMLInputElement)) return;

    const fieldBox = input.closest('[data-form-field]');

    if (!fieldBox) return;

    const label = fieldBox.querySelector('.register-field__label');
    const inputClass = 'register-field__input_error';
    const labelClass = 'register-field__label_error';

    fieldBox.querySelector('.register-field__error')?.remove();

    if (!message) {
      input.classList.remove(inputClass);
      label?.classList.remove(labelClass);
      return;
    }

    input.classList.add(inputClass);
    label?.classList.add(labelClass);

    const errorHtml = `
        <p class="register-field__error">
            <svg fill="none" viewBox="0 0 22 22" stroke-width="1.5" stroke="currentColor" class="icon icon_sm icon_no-shrink icon_danger">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            ${escapeHtml(message)}
        </p>`;

    input.insertAdjacentHTML('afterend', errorHtml);
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

    this.submitAttempted = true;
    this.readForm();

    this.fieldErrors.value = {};
    this.generalError.value = null;

    const { isValid, fieldErrors } = validateForm((field) => this.getFieldValue(field));

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
