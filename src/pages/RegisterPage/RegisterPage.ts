import './RegisterPage.scss';
import { LoginPage } from '@/pages/LoginPage/LoginPage.ts';
import { Page } from '@/pages/Page.ts';
import { ROUTES } from '@/constants/Routes.ts';
import type { RegisterField } from '@/api/auth/auth.types.ts';
import { RegisterPageModel } from './RegisterPage.model.ts';
import { eventBus } from '@/helpers/EventBus.ts';
import { renderFieldError } from '@/helpers/FieldError.ts';
import { renderRegisterError } from '@/components/register/registerError.ts';
import { renderRegisterForm } from '@/components/register/registerForm.ts';
import { renderRegisterHeader } from '@/components/register/registerHeader.ts';
import { showPage } from '@/helpers/ShowPage.ts';
import { ELEMENT_IDS, ERROR_MESSAGES } from './register.constants.ts';

/**
 * View страницы регистрации.
 */
export class RegisterPage extends Page {
  static route = ROUTES.REGISTER;

  private readonly model = new RegisterPageModel();

  private offSuccess?: () => void;

  constructor() {
    super();

    this.setSubscribers([this.model.fieldErrors], () => this.updateFieldErrors());
    this.setSubscribers([this.model.generalError], () => this.updateGeneralError());
    this.setSubscribers([this.model.isSubmitting], () => this.updateSubmittingState());
  }

  render(): string {
    return `
      <div class="register-page">
        ${renderRegisterHeader()}
        <div class="register-page__main">
          <div class="register-page__content">
            <div class="register-page__form-box">
              <div data-general-error-slot>
                ${renderRegisterError(this.model.generalError.value)}
              </div>
              ${renderRegisterForm({
                formData: this.model.formData,
                fieldErrors: this.model.fieldErrors.value,
                isSubmitting: this.model.isSubmitting.value,
              })}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private updateFieldErrors(): void {
    if (!this.container) return;

    const errors = this.model.fieldErrors.value;

    (Object.keys(this.model.formData) as RegisterField[]).forEach((fieldId) => {
      const wrapper = this.container?.querySelector(`[data-form-field="${fieldId}"]`);
      if (!wrapper) return;

      const errKey = errors[fieldId];
      const errorMessage = errKey ? ERROR_MESSAGES[errKey] || errKey : '';
      const hasError = Boolean(errorMessage);

      const label = wrapper.querySelector('label');
      const input = wrapper.querySelector('input');
      const description = wrapper.querySelector('[data-field-description]');
      const errorSlot = wrapper.querySelector('[data-field-error]');

      const formControls: Array<[Element | null, string]> = [
        [label, 'register-field__label_error'],
        [input, 'register-field__input_error'],
      ];

      formControls.forEach(([el, className]) => {
        el?.classList.toggle(className, hasError);
      });

      description?.classList.toggle('is-hidden', hasError);

      if (errorSlot) {
        errorSlot.innerHTML = renderFieldError(errorMessage, 'register-field__error');
      }
    });
  }

  private updateGeneralError(): void {
    if (!this.container) return;

    const slot = this.container.querySelector('[data-general-error-slot]');
    if (slot) {
      slot.innerHTML = renderRegisterError(this.model.generalError.value);
    }
  }

  private updateSubmittingState(): void {
    const submitBtn = document.getElementById(ELEMENT_IDS.SUBMIT_BUTTON);
    if (!(submitBtn instanceof HTMLButtonElement)) return;

    const isSubmitting = this.model.isSubmitting.value;
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? 'Создание...' : 'Создать аккаунт';
  }

  bindEvents(): void {
    document.getElementById(ELEMENT_IDS.FORM)?.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();
      eventBus.emit('register:submit');
    });

    (Object.keys(this.model.formData) as RegisterField[]).forEach((fieldName) => {
      const input = document.getElementById(fieldName);
      input?.addEventListener('input', () => {
        if (!(input instanceof HTMLInputElement)) return;
        eventBus.emit('register:field-change', { field: fieldName, value: input.value });
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

  async afterMount(): Promise<void> {
    this.offSuccess = eventBus.on('register:success', () => {
      void showPage(LoginPage);
    });
  }

  unmount(): void {
    this.offSuccess?.();
    this.model.destroy();
    super.unmount();
  }
}
