import './RegisterPage.scss';
import { ChatsPage } from '@/pages/ChatsPage/ChatsPage.js';
import { Page } from '@/pages/Page.js';
import { ROUTES } from '@/constants/Routes.js';
import type { RegisterField } from '@/api/auth/auth.types.js';
import { RegisterPageModel } from '@/pages/RegisterPage/RegisterPage.model.js';
import { bindPasswordToggles } from '@/helpers/PasswordToggle.js';
import { eventBus } from '@/helpers/EventBus.js';
import { renderFieldError } from '@/helpers/FieldError.js';
import { renderRegisterError } from '@/components/register/registerError.js';
import { renderRegisterForm } from '@/components/register/registerForm.js';
import { renderRegisterHeader } from '@/components/register/registerHeader.js';
import { showPage } from '@/helpers/ShowPage.js';
import { ELEMENT_IDS, ERROR_MESSAGES } from '@/pages/RegisterPage/register.constants.js';

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
      const errKey = errors[fieldId];
      this.setFieldErrorDom(fieldId, errKey ? ERROR_MESSAGES[errKey] || errKey : '');
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

  /**
   * Обновляет/убирает сообщение об ошибке под конкретным полем
   * без перерендера всей формы.
   */
  private setFieldErrorDom(field: RegisterField, message: string): void {
    const wrapper = this.container?.querySelector(`[data-form-field="${field}"]`);
    if (!wrapper) return;

    const hasError = Boolean(message);

    (['label', 'input'] as const).forEach((tag) => {
      wrapper.querySelector(tag)?.classList.toggle(`register-field__${tag}_error`, hasError);
    });

    wrapper.querySelector('[data-field-description]')?.classList.toggle('is-hidden', hasError);

    const errorSlot = wrapper.querySelector('[data-field-error]');
    if (errorSlot) {
      errorSlot.innerHTML = renderFieldError(message, 'register-field__error');
    }
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

      input?.addEventListener('blur', () => {
        eventBus.emit('register:field-blur', { field: fieldName });
      });
    });

    if (this.container) {
      bindPasswordToggles(this.container);
    }
  }

  async afterMount(): Promise<void> {
    this.offSuccess = eventBus.on('register:success', () => {
      void showPage(ChatsPage, { replace: true });
    });
  }

  unmount(): void {
    this.offSuccess?.();
    this.model.destroy();
    super.unmount();
  }
}
