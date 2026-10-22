import { AuthLayout, loadAuthLayoutTemplate } from '@/components/Auth/AuthLayout.js';
import { AuthForm, loadAuthFormTemplate } from '@/components/Auth/AuthForm.js';
import { loadFieldTemplate } from '@/components/Auth/Field.js';
import { AuthApi } from '@/api/auth/AuthApi.js';
import {
  validateEmail,
  validateForbiddenChars,
  validateMultiple,
  validatePassword,
} from '@/helpers/Validation.ts';
import { Page } from '@/pages/Page.js';
import { ROUTES } from '@/constants/Routes.js';
import { LOGIN_FORM_ID, LOGIN_SUBMIT_ID } from '@/constants/Login.js';
import { STATUSES } from '@/constants/Statuses.js';
import {
  ERROR_CODES,
  ERROR_HINTS,
  ERROR_MESSAGES,
  type ErrorCodes,
} from '@/api/error.constants.js';
import { showPage } from '@/helpers/ShowPage.js';
import { ChatsPage } from '@/pages/ChatsPage/ChatsPage.js';
import { RegisterPage } from '@/pages/RegisterPage/RegisterPage.js';
import { ApiError } from '@/api/ApiResponse.js';
import { Signal } from '@/reactive/Signal';
import type { LoginData, LoginFieldConfig, LoginFieldErrors } from '@/api/auth/auth.types';

export class LoginPage extends Page {
  static route = ROUTES.LOGIN;

  private fieldErrors = new Signal<LoginFieldErrors>({});
  private generalError = new Signal<string>('');
  private generalErrorHint = new Signal<string>('');
  private loading = new Signal<boolean>(false);

  private values: LoginData = {
    email: '',
    password: '',
  };

  constructor() {
    super();

    this.fieldErrors.subscribe(() => this.rerender());
    this.generalError.subscribe(() => this.rerender());
    this.generalErrorHint.subscribe(() => this.rerender());
    this.loading.subscribe(() => this.rerender());
  }

  render(): string {
    const authForm = AuthForm({
      formId: LOGIN_FORM_ID,
      submitId: LOGIN_SUBMIT_ID,
      title: 'С возвращением',
      subtitle: 'Введите адрес электронной почты, чтобы продолжить общение в Связь.',
      fields: this.buildFields(),
      submitText: 'Войти',
      footer: `Впервые здесь? <a href="${ROUTES.REGISTER}" data-page-route="register" class="font-semibold text-gray-900 hover:underline">Создать аккаунт</a>`,
      generalError: this.generalError,
      generalErrorHint: this.generalErrorHint,
      loading: this.loading,
    });

    return AuthLayout({
      title: 'Общение, которое<br />всегда рядом',
      subtitle: 'Продолжайте разговоры на большом экране',
      children: authForm,
    });
  }

  async loadTemplates(): Promise<void> {
    await Promise.all([loadAuthFormTemplate(), loadAuthLayoutTemplate(), loadFieldTemplate()]);
  }

  buildFields(): LoginFieldConfig[] {
    const fieldErrors = this.fieldErrors.get();

    return [
      {
        id: 'email',
        name: 'email',
        type: 'email',
        label: 'Электронная почта',
        placeholder: 'name@example.com',
        value: this.values.email,
        error: fieldErrors.email ?? '',
      },
      {
        id: 'password',
        name: 'password',
        type: 'password',
        label: 'Пароль',
        placeholder: 'password',
        value: this.values.password,
        error: fieldErrors.password ?? '',
      },
    ];
  }

  rerender(): void {
    if (!this.container) return;

    this.container.innerHTML = this.render();
    this.bindEvents();
  }

  bindEvents(): void {
    const form = document.getElementById(LOGIN_FORM_ID);

    form?.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();
      void this.submit();
    });

    this.container?.querySelectorAll<HTMLElement>('[data-toggle-password]').forEach((button) => {
      button.addEventListener('click', () => {
        this.togglePassword(button);
      });
    });

    this.container
      ?.querySelector('[data-page-route="register"]')
      ?.addEventListener('click', (event: MouseEvent) => {
        event.preventDefault();
        void showPage(RegisterPage);
      });
  }

  togglePassword(button: HTMLElement): void {
    const inputId = button.dataset.togglePassword;

    if (!inputId) return;

    const input = document.getElementById(inputId);

    if (!(input instanceof HTMLInputElement)) return;

    const show = input.type === 'password';

    input.type = show ? 'text' : 'password';

    button.querySelector('[data-eye="open"]')?.classList.toggle('hidden', show);

    button.querySelector('[data-eye="closed"]')?.classList.toggle('hidden', !show);
  }

  async submit(): Promise<void> {
    if (this.loading.get()) return;

    const emailElement = document.getElementById('email');
    const passwordElement = document.getElementById('password');

    if (
      !(emailElement instanceof HTMLInputElement) ||
      !(passwordElement instanceof HTMLInputElement)
    ) {
      return;
    }

    this.values.email = emailElement.value.trim().toLowerCase();
    this.values.password = passwordElement.value;

    this.fieldErrors.set({});
    this.generalError.set('');
    this.generalErrorHint.set('');

    const emailError = validateMultiple([validateEmail, validateForbiddenChars], this.values.email);
    const passwordError = validateMultiple(
      [validatePassword, validateForbiddenChars],
      this.values.password,
    );

    if (emailError || passwordError) {
      this.fieldErrors.set({
        ...(emailError ? { email: emailError } : {}),
        ...(passwordError ? { password: passwordError } : {}),
      });
      return;
    }

    this.loading.set(true);

    const result = await AuthApi.login(this.values);

    this.loading.set(false);

    if (result instanceof ApiError) {
      const isCredentialsError =
        result.code === ERROR_CODES.UNAUTHORIZED ||
        result.code === ERROR_CODES.INVALID_CREDENTIALS ||
        result.status === STATUSES.BAD_REQUEST;

      const errorCode = isCredentialsError
        ? ERROR_CODES.INVALID_CREDENTIALS
        : ([ERROR_CODES.NETWORK_ERROR, ERROR_CODES.INTERNAL_ERROR] as ErrorCodes[]).includes(
              result.code as ErrorCodes,
            )
          ? result.code
          : ERROR_CODES.INTERNAL_ERROR;

      this.generalError.set(ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]);

      this.generalErrorHint.set(ERROR_HINTS[errorCode] ?? ERROR_HINTS[ERROR_CODES.UNKNOWN_ERROR]);

      return;
    }

    await showPage(ChatsPage);
  }
}
