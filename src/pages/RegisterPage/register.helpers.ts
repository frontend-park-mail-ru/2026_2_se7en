import { VALIDATION_MESSAGES } from '@/constants/Validation';
import { VALIDATION_RULES } from '@/pages/RegisterPage/register.constants.ts';
import { validateForbiddenChars } from '@/helpers/Validation.ts';
import type {
  FieldValidationError,
  ValidationReason,
  ValidationResult,
} from '@/pages/RegisterPage/register.types.ts';
import type { RegisterField, RegisterFieldErrors } from '@/api/auth/auth.types';

/**
 * Нормализует причину ошибки валидации от сервера в типизированный формат.
 */
export function normalizeValidationReason(field: RegisterField, reason: string): ValidationReason {
  const normalized = String(reason).toLowerCase();

  if (normalized.includes('required')) {
    return 'required';
  }

  if (field === 'nickname') {
    if (normalized.includes('already exists')) {
      return 'nickname_already_exists';
    }

    if (normalized.includes('length')) {
      return 'nickname_length';
    }

    if (normalized.includes('format')) {
      return 'nickname_invalid_format';
    }
  }

  if (field === 'password' && normalized.includes('length')) {
    return 'password_length';
  }

  if (field === 'email') {
    if (normalized.includes('already exists')) {
      return 'email_already_exists';
    }

    if (normalized.includes('maximum length')) {
      return 'email_max_length';
    }

    if (normalized.includes('format')) {
      return 'email_invalid_format';
    }
  }

  if (field === 'first_name' && normalized.includes('maximum length')) {
    return 'first_name_max_length';
  }

  return 'invalid_format';
}

/**
 * Валидирует одно поле формы регистрации по его правилам.
 * @returns причина ошибки или null, если поле валидно
 */
export function validateSingleField(field: RegisterField, value: string): ValidationReason | null {
  const rules = VALIDATION_RULES[field];

  if (rules.required && !value) {
    return 'required';
  }

  if (!value) {
    return null;
  }

  const forbiddenReason = validateForbiddenChars(value);

  if (forbiddenReason) {
    return forbiddenReason === VALIDATION_MESSAGES.CONTAINS_EMOJI
      ? 'contains_emoji'
      : 'contains_invalid_chars';
  }

  if (rules.minLength && value.length < rules.minLength) {
    return `${field}_length` as ValidationReason;
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return (
      field === 'nickname' || field === 'password' ? `${field}_length` : `${field}_max_length`
    ) as ValidationReason;
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return `${field}_invalid_format` as ValidationReason;
  }

  return null;
}

/**
 * Валидирует все поля формы регистрации на клиенте.
 */
export function validateForm(getFieldValue: (field: RegisterField) => string): ValidationResult {
  const fieldErrors: RegisterFieldErrors = {};
  const errors: FieldValidationError[] = [];

  const fieldsToValidate: RegisterField[] = ['first_name', 'nickname', 'email', 'password'];

  for (const field of fieldsToValidate) {
    const value = getFieldValue(field);
    const reason = validateSingleField(field, value);

    if (reason) {
      fieldErrors[field] = reason;
      errors.push({ field, reason });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors,
  };
}
