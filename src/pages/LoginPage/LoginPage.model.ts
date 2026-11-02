import { ApiError } from '@/api/ApiResponse.ts';
import { STATUSES } from '@/constants/Statuses.ts';
import { eventBus } from '@/helpers/EventBus.ts';
import { Signal } from '@/reactive/Signal.ts';
import { user } from '@/store/User.ts';
import {
  ERROR_CODES,
  ERROR_HINTS,
  ERROR_MESSAGES,
  type ErrorCodes,
} from '@/api/error.constants.ts';
import {
  validateEmail,
  validateForbiddenChars,
  validateMultiple,
  validatePassword,
} from '@/helpers/Validation.ts';
import type { LoginData, LoginFieldErrors } from '@/api/auth/auth.types.ts';

/**
 * Модель страницы входа.
 *
 * Связь с View:
 * - View → Model: EventBus (`login:submit`, `login:field-change`).
 * - Model → View: Signal (View подписан на изменения стейта).
 * - Model → кто угодно: EventBus (`login:success`).
 */
export class LoginPageModel {
  readonly fieldErrors = new Signal<LoginFieldErrors>({});
  readonly generalError = new Signal<string>('');
  readonly generalErrorHint = new Signal<string>('');
  readonly loading = new Signal<boolean>(false);

  /**
   * Значения полей — обычный объект, не Signal.
   * Обновляется через `setField` из обработчика ввода.
   */
  values: LoginData = {
    email: '',
    password: '',
  };

  private readonly offSubmit: () => void;
  private readonly offFieldChange: () => void;

  constructor() {
    this.offSubmit = eventBus.on('login:submit', () => {
      void this.submit();
    });

    this.offFieldChange = eventBus.on('login:field-change', ({ field, value }) => {
      this.setField(field, value);
    });
  }

  destroy(): void {
    this.offSubmit();
    this.offFieldChange();
  }

  /**
   * Обновить одно поле формы и сбросить его ошибку, если была.
   */
  private setField(field: keyof LoginData, value: string): void {
    this.values[field] = value;

    if (field in this.fieldErrors.value) {
      const next = { ...this.fieldErrors.value };
      delete next[field];
      this.fieldErrors.value = next;
    }

    if (this.generalError.value !== '') {
      this.generalError.value = '';
      this.generalErrorHint.value = '';
    }
  }

  /**
   * Отправить форму: провалидировать, войти через API, разобрать ответ.
   */
  private async submit(): Promise<void> {
    if (this.loading.value) return;

    this.fieldErrors.value = {};
    this.generalError.value = '';
    this.generalErrorHint.value = '';

    const emailError = validateMultiple([validateEmail, validateForbiddenChars], this.values.email);
    const passwordError = validateMultiple(
      [validatePassword, validateForbiddenChars],
      this.values.password,
    );

    if (emailError || passwordError) {
      this.fieldErrors.value = {
        ...(emailError ? { email: emailError } : {}),
        ...(passwordError ? { password: passwordError } : {}),
      };
      return;
    }

    this.loading.value = true;

    const result = await user.login(this.values);

    this.loading.value = false;

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

      this.generalError.value =
        ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];

      this.generalErrorHint.value =
        ERROR_HINTS[errorCode] ?? ERROR_HINTS[ERROR_CODES.UNKNOWN_ERROR];

      return;
    }

    eventBus.emit('login:success');
  }
}
