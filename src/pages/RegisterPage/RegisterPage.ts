import { STATUSES } from '@/constants/Statuses.js';
import { ELEMENT_IDS, VALIDATION_RULES } from '@/pages/RegisterPage/register.constants.js';
import { Page } from '@/pages/Page.js';
import { renderRegisterHeader } from '@/components/register/registerHeader.js';
import { renderRegisterForm } from '@/components/register/registerForm.js';
import { renderRegisterError } from '@/components/register/registerError.js';
import { validateForm } from '@/pages/RegisterPage/register.helpers.js';
import { AuthApi } from '@/api/auth/AuthApi.js';
import { ROUTES } from '@/constants/Routes.js';
import { showPage } from '@/helpers/ShowPage.js';
import { LoginPage } from '@/pages/LoginPage/LoginPage.js';
import { ApiError } from '@/api/ApiResponse.js';
import { Signal } from '@/reactive/Signal';
import type {
  RegisterField,
  RegisterFieldErrors,
  RegisterFormData,
} from '@/api/auth/auth.types.js';

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

    this.fieldErrors.subscribe(() => this.rerender());
    this.generalError.subscribe(() => this.rerender());
    this.isSubmitting.subscribe(() => this.rerender());
  }

  render(): string {
    return `
      <div class="min-h-screen flex bg-white">
        ${renderRegisterHeader()}
        <div class="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col">
          <div class="flex-1 flex items-center justify-center">
            <div class="w-full max-w-md relative">
              ${renderRegisterError(this.generalError.get())}
              ${renderRegisterForm({
                formData: this.formData,
                fieldErrors: this.fieldErrors.get(),
                isSubmitting: this.isSubmitting.get(),
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

        if (this.fieldErrors.get()[fieldName]) {
          const { [fieldName]: _removed, ...rest } = this.fieldErrors.get();
          this.fieldErrors.set(rest);
        }

        if (this.generalError.get() !== null) {
          this.generalError.set(null);
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

    if (this.isSubmitting.get()) return;

    this.readForm();

    this.fieldErrors.set({});
    this.generalError.set(null);

    const { isValid, fieldErrors } = validateForm((field) => {
      const fieldName = field as RegisterField;
      const value = this.formData[fieldName];

      return fieldName === 'password' ? value : value.trim();
    });

    if (!isValid) {
      this.fieldErrors.set(fieldErrors);
      return;
    }

    this.isSubmitting.set(true);

    const result = await AuthApi.register({
      email: this.formData.email.trim().toLowerCase(),
      password: this.formData.password,
      nickname: this.formData.nickname.trim(),
      first_name: this.formData.first_name.trim(),
    });

    this.isSubmitting.set(false);

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
      this.fieldErrors.set(nextErrors);
      return;
    }

    if (result instanceof ApiError) {
      this.generalError.set(result.message || 'Произошла ошибка при регистрации');
    }
  }
}
