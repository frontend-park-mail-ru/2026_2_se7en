import { VALIDATION_RULES } from '@/pages/RegisterPage/register.constants.ts';
import { VALIDATION_MESSAGES } from '@/constants/Validation';
import { validateForbiddenChars } from '@/helpers/Validation.ts';
import type { RegisterFieldErrors, RegisterField } from '@/api/auth/auth.types';
import type {
  ValidationReason,
  ValidationResult,
  FieldValidationError,
} from '@/pages/RegisterPage/register.types.ts';

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
 * Валидирует все поля формы регистрации на клиенте.
 */
export function validateForm(getFieldValue: (field: RegisterField) => string): ValidationResult {
  const fieldErrors: RegisterFieldErrors = {};
  const errors: FieldValidationError[] = [];

  const fieldsToValidate: RegisterField[] = ['first_name', 'nickname', 'email', 'password'];

  for (const field of fieldsToValidate) {
    const rules = VALIDATION_RULES[field];
    const value = getFieldValue(field);

    if (rules.required && !value) {
      fieldErrors[field] = 'required';
      errors.push({ field, reason: 'required' });
      continue;
    }

    if (value) {
      const forbiddenReason = validateForbiddenChars(value);

      if (forbiddenReason) {
        const reason: ValidationReason =
          forbiddenReason === VALIDATION_MESSAGES.CONTAINS_EMOJI
            ? 'contains_emoji'
            : 'contains_invalid_chars';

        fieldErrors[field] = reason;
        errors.push({ field, reason });
        continue;
      }

      if (rules.minLength && value.length < rules.minLength) {
        const reason: ValidationReason =
          field === 'nickname' ? 'nickname_length' : 'password_length';

        fieldErrors[field] = reason;
        errors.push({ field, reason });
      } else if (rules.maxLength && value.length > rules.maxLength) {
        const reason: ValidationReason =
          field === 'nickname' || field === 'password'
            ? (`${field}_length` as ValidationReason)
            : (`${field}_max_length` as ValidationReason);

        fieldErrors[field] = reason;
        errors.push({ field, reason });
      } else if (rules.pattern && !rules.pattern.test(value)) {
        const reason: ValidationReason =
          field === 'nickname'
            ? 'nickname_invalid_format'
            : (`${field}_invalid_format` as ValidationReason);

        fieldErrors[field] = reason;
        errors.push({ field, reason });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors,
  };
}
