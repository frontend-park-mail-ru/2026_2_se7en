import { ChatsPage } from '@/pages/ChatsPage/ChatsPage.ts';
import { Page } from '@/pages/Page.ts';
import { ROUTES } from '@/constants/Routes.ts';
import { LOGIN_FORM_ID, LOGIN_SUBMIT_ID } from '@/constants/Login.ts';
import { eventBus } from '@/helpers/EventBus.ts';
import { showPage } from '@/helpers/ShowPage.ts';
import { renderFieldError } from '@/helpers/FieldError.ts';
import { AuthForm, renderAuthError } from '@/components/Auth/AuthForm.ts';
import { AuthLayout } from '@/components/Auth/AuthLayout.ts';
import { LoginPageModel } from './LoginPage.model.ts';
import type { LoginFieldConfig } from '@/api/auth/auth.types.ts';
import { SpinnerIcon } from '@/components/core/Icons.ts';

/**
 * View страницы входа.
 */
export class LoginPage extends Page {
  static route = ROUTES.LOGIN;

  private readonly model = new LoginPageModel();
  private offSuccess?: () => void;

  constructor() {
    super();

    this.setSubscribers([this.model.fieldErrors], () => this.updateFieldErrors());
    this.setSubscribers([this.model.generalError, this.model.generalErrorHint], () =>
      this.updateGeneralError(),
    );
    this.setSubscribers([this.model.loading], () => this.updateLoading());
  }

  render(): string {
    const authForm = AuthForm({
      formId: LOGIN_FORM_ID,
      submitId: LOGIN_SUBMIT_ID,
      title: 'С возвращением',
      subtitle: 'Введите адрес электронной почты, чтобы продолжить общение в Связь.',
      fields: this.buildFields(),
      submitText: 'Войти',
      footer: `Впервые здесь? <a href="${ROUTES.REGISTER}" data-page-route="register" class="auth-form__footer-link">Создать аккаунт</a>`,
      generalError: this.model.generalError.value,
      generalErrorHint: this.model.generalErrorHint.value,
      loading: this.model.loading.value,
    });

    return AuthLayout({
      title: 'Общение, которое<br />всегда рядом',
      subtitle: 'Продолжайте разговоры на большом экране',
      children: authForm,
    });
  }

  private buildFields(): LoginFieldConfig[] {
    const fieldErrors = this.model.fieldErrors.value;

    return [
      {
        id: 'email',
        name: 'email',
        type: 'email',
        label: 'Электронная почта',
        placeholder: 'name@example.com',
        value: this.model.values.email,
        error: fieldErrors.email ?? '',
      },
      {
        id: 'password',
        name: 'password',
        type: 'password',
        label: 'Пароль',
        placeholder: 'password',
        value: this.model.values.password,
        error: fieldErrors.password ?? '',
      },
    ];
  }

  private updateFieldErrors(): void {
    if (!this.container) return;

    const errors = this.model.fieldErrors.value;

    for (const field of ['email', 'password'] as const) {
      const wrapper = this.container.querySelector(`[data-form-field="${field}"]`);
      if (!wrapper) continue;

      const errorMessage = errors[field] ?? '';
      const hasError = Boolean(errorMessage);

      const errorSlot = wrapper.querySelector('[data-field-error]');

      ['label', 'input'].forEach((name) => {
        wrapper.querySelector(name)?.classList.toggle(`field__${name}_error`, hasError);
      });

      if (errorSlot) {
        errorSlot.innerHTML = renderFieldError(errorMessage, 'field__error');
      }
    }
  }

  private updateGeneralError(): void {
    if (!this.container) return;

    const slot = this.container.querySelector('[data-general-error-slot]');
    if (slot) {
      slot.innerHTML = renderAuthError(
        this.model.generalError.value,
        this.model.generalErrorHint.value,
      );
    }
  }

  private updateLoading(): void {
    const oldBtn = document.getElementById(LOGIN_SUBMIT_ID);
    if (!(oldBtn instanceof HTMLButtonElement)) return;

    const loading = this.model.loading.value;

    oldBtn.disabled = loading;
    oldBtn.innerHTML = loading ? `${SpinnerIcon} Проверяем данные...` : 'Войти';
  }

  bindEvents(): void {
    const form = document.getElementById(LOGIN_FORM_ID);

    form?.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();
      eventBus.emit('login:submit');
    });

    for (const field of ['email', 'password'] as const) {
      const input = document.getElementById(field);
      input?.addEventListener('input', () => {
        if (!(input instanceof HTMLInputElement)) return;
        eventBus.emit('login:field-change', { field, value: input.value });
      });
    }

    this.container?.querySelectorAll<HTMLElement>('[data-toggle-password]').forEach((button) => {
      button.addEventListener('click', () => this.togglePassword(button));
    });
  }

  private togglePassword(button: HTMLElement): void {
    const inputId = button.dataset.togglePassword;
    if (!inputId) return;

    const input = document.getElementById(inputId);
    if (!(input instanceof HTMLInputElement)) return;

    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';

    button.querySelector('[data-eye="open"]')?.classList.toggle('is-hidden', show);
    button.querySelector('[data-eye="closed"]')?.classList.toggle('is-hidden', !show);
  }

  async afterMount(): Promise<void> {
    this.offSuccess = eventBus.on('login:success', () => {
      void showPage(ChatsPage, { replace: true });
    });
  }

  unmount(): void {
    this.offSuccess?.();
    this.model.destroy();
    super.unmount();
  }
}
