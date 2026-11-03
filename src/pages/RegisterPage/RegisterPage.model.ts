import { ApiError } from '@/api/ApiResponse.ts';
import { AuthApi } from '@/api/auth/AuthApi.ts';
import { STATUSES } from '@/constants/Statuses.ts';
import { Signal } from '@/reactive/Signal.ts';
import { eventBus } from '@/helpers/EventBus.ts';
import { normalizeValidationReason, validateForm } from './register.helpers.ts';
import type {
  RegisterField,
  RegisterFieldErrors,
  RegisterFormData,
} from '@/api/auth/auth.types.ts';

/**
 * Модель страницы регистрации.
 *
 * Хранит стейт (Signal) и содержит всю логику: валидацию, запрос к API,
 * разбор ошибок.
 *
 * Связь с View:
 * - View → Model: EventBus (`register:submit`, `register:field-change`).
 * - Model → View: Signal (View подписан на изменения стейта).
 * - Model → кто угодно: EventBus (`register:success`).
 */
export class RegisterPageModel {
  readonly fieldErrors = new Signal<RegisterFieldErrors>({});
  readonly generalError = new Signal<string | null>(null);
  readonly isSubmitting = new Signal<boolean>(false);

  formData: RegisterFormData = {
    first_name: '',
    nickname: '',
    email: '',
    password: '',
  };

  private readonly offSubmit: () => void;
  private readonly offFieldChange: () => void;

  constructor() {
    this.offSubmit = eventBus.on('register:submit', () => {
      void this.submit();
    });

    this.offFieldChange = eventBus.on('register:field-change', ({ field, value }) => {
      this.setField(field, value);
    });
  }

  destroy(): void {
    this.offSubmit();
    this.offFieldChange();
  }

  private setField(field: RegisterField, value: string): void {
    this.formData[field] = value;

    if (field in this.fieldErrors.value) {
      this.fieldErrors.value = Object.fromEntries(
        Object.entries(this.fieldErrors.value).filter(([key]) => key !== field),
      );
    }

    this.generalError.value = null;
  }

  private async submit(): Promise<void> {
    if (this.isSubmitting.value) return;

    this.fieldErrors.value = {};
    this.generalError.value = null;

    const { isValid, fieldErrors } = validateForm((field) => {
      const value = this.formData[field];
      return field === 'password' ? value : value.trim();
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
      eventBus.emit('register:success');
      return;
    }

    const nextErrors: RegisterFieldErrors = {};

    if (result instanceof ApiError) {
      if (Array.isArray(result.details)) {
        for (const detail of result.details) {
          const field = detail.field as RegisterField;

          if (field in this.formData && !nextErrors[field]) {
            nextErrors[field] = normalizeValidationReason(field, detail.reason);
          }
        }
      }

      if (result.status === STATUSES.CONFLICT) {
        switch (result.code) {
          case 'EMAIL_TAKEN':
            nextErrors.email = 'email_already_exists';
            break;
          case 'NICKNAME_TAKEN':
            nextErrors.nickname = 'nickname_already_exists';
            break;
          default:
            break;
        }
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      this.fieldErrors.value = nextErrors;
      return;
    }

    if (result instanceof ApiError) {
      this.generalError.value =
        result.status === STATUSES.BAD_REQUEST
          ? 'Проверьте правильность заполнения полей'
          : result.message || 'Произошла ошибка при регистрации';
    }
  }
}
