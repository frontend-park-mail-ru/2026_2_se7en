import type { ProfileTab } from '@/components/profile/profile.types.ts';
import { validateForbiddenChars } from '@/helpers/Validation.ts';
import {
  EMAIL_REGEX,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  VALIDATION_MESSAGES,
} from '@/constants/Validation.ts';
import {
  PROFILE_ERROR_MESSAGES,
  PROFILE_LIMITS,
  PROFILE_REGEXES,
  PROFILE_TAB_FIELDS,
} from '@/constants/Profile.ts';
import type {
  ProfileField,
  ProfileFieldErrors,
  ProfileFormValues,
} from '@/api/profile/profile.types.ts';

/** Поля, для которых не применяется trim при валидации. */
const PASSWORD_FIELDS = ['old_password', 'new_password', 'confirm_password'] as const;
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

/** Проверяет формат и размер аватара в соответствии с ограничениями backend. */
export function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    return 'Выберите фотографию в формате PNG, JPEG или WebP.';
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return 'Размер фотографии не должен превышать 5 МиБ.';
  }

  return null;
}

/**
 * Возвращает человекочитаемый текст ошибки по ключу.
 */
export function getProfileErrorMessage(errorKey?: string): string {
  if (!errorKey) {
    return '';
  }

  return PROFILE_ERROR_MESSAGES[errorKey] || errorKey;
}

/**
 * Проверяет одно поле профиля по правилам бэкенда (internal/tools/validators.go).
 */
export function validateProfileField(
  field: ProfileField,
  rawValue: string,
  allValues: ProfileFormValues,
): string | null {
  const isPasswordField = (PASSWORD_FIELDS as readonly string[]).includes(field);
  const value = isPasswordField ? rawValue : rawValue.trim();

  if (field === 'last_name' && !value) {
    return null;
  }

  if (!value) {
    return 'required';
  }

  const forbidden = validateForbiddenChars(value);
  if (forbidden) {
    return forbidden === VALIDATION_MESSAGES.CONTAINS_EMOJI
      ? 'contains_emoji'
      : 'contains_invalid_chars';
  }

  switch (field) {
    case 'first_name': {
      const charCount = Array.from(value).length;
      if (
        charCount < PROFILE_LIMITS.MIN_NAME_LENGTH ||
        charCount > PROFILE_LIMITS.MAX_NAME_LENGTH
      ) {
        return 'first_name_length';
      }
      if (!PROFILE_REGEXES.NAME_NO_DIGITS.test(value)) {
        return 'first_name_no_digits';
      }
      return null;
    }

    case 'last_name': {
      const charCount = Array.from(value).length;
      if (
        charCount < PROFILE_LIMITS.MIN_NAME_LENGTH ||
        charCount > PROFILE_LIMITS.MAX_NAME_LENGTH
      ) {
        return 'last_name_length';
      }
      if (!PROFILE_REGEXES.NAME_NO_DIGITS.test(value)) {
        return 'last_name_no_digits';
      }
      return null;
    }

    case 'nickname': {
      if (
        value.length < PROFILE_LIMITS.MIN_NICKNAME_LENGTH ||
        value.length > PROFILE_LIMITS.MAX_NICKNAME_LENGTH
      ) {
        return 'nickname_length';
      }
      if (!PROFILE_REGEXES.NICKNAME.test(value)) {
        return 'nickname_invalid_format';
      }
      return null;
    }

    case 'email': {
      if (value.length > PROFILE_LIMITS.MAX_EMAIL_LENGTH) {
        return 'email_max_length';
      }
      if (!EMAIL_REGEX.test(value)) {
        return 'email_invalid_format';
      }
      return null;
    }

    case 'phone': {
      if (!PROFILE_REGEXES.PHONE.test(value)) {
        return 'phone_invalid_format';
      }
      return null;
    }

    case 'old_password': {
      if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) {
        return 'password_length';
      }
      return null;
    }

    case 'new_password': {
      if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) {
        return 'password_length';
      }
      if (allValues.old_password && value === allValues.old_password) {
        return 'new_password_same_as_old';
      }
      return null;
    }

    case 'confirm_password': {
      if (value !== allValues.new_password) {
        return 'passwords_do_not_match';
      }
      return null;
    }

    default:
      return null;
  }
}

/**
 * Валидирует все поля активной вкладки профиля.
 */
export function validateProfileTab(
  tab: Exclude<ProfileTab, 'security'>,
  values: ProfileFormValues,
): { isValid: boolean; fieldErrors: ProfileFieldErrors } {
  const fields = PROFILE_TAB_FIELDS[tab];
  const fieldErrors: ProfileFieldErrors = {};

  for (const field of fields) {
    const error = validateProfileField(field, values[field], values);
    if (error) {
      fieldErrors[field] = error;
    }
  }

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}

/**
 * Нормализует ошибку из ErrorDetail бэкенда для конкретного поля.
 */
export function normalizeProfileBackendReason(field: ProfileField, reason: string): string {
  const normalized = String(reason).toLowerCase();

  if (normalized === 'required' || normalized.includes('required')) {
    return 'required';
  }

  switch (field) {
    case 'nickname':
      if (normalized.includes('already exists') || normalized.includes('taken')) {
        return 'nickname_already_exists';
      }
      if (normalized === 'invalid_length' || normalized.includes('length')) {
        return 'nickname_length';
      }
      return 'nickname_invalid_format';

    case 'email':
      if (normalized.includes('already exists') || normalized.includes('taken')) {
        return 'email_already_exists';
      }
      if (normalized === 'too_long' || normalized.includes('length')) {
        return 'email_max_length';
      }
      return 'email_invalid_format';

    case 'phone':
      if (normalized.includes('already exists') || normalized.includes('taken')) {
        return 'phone_already_exists';
      }
      return 'phone_invalid_format';

    case 'first_name':
      if (normalized === 'contains_digits' || normalized.includes('digit')) {
        return 'first_name_no_digits';
      }
      return 'first_name_length';

    case 'last_name':
      if (normalized === 'contains_digits' || normalized.includes('digit')) {
        return 'last_name_no_digits';
      }
      return 'last_name_length';

    case 'old_password':
      if (normalized === 'invalid_length' || normalized.includes('length')) {
        return 'password_length';
      }
      return 'invalid_old_password';

    case 'new_password':
      if (normalized === 'invalid_length' || normalized.includes('length')) {
        return 'password_length';
      }
      return 'invalid_format';

    default:
      return 'invalid_format';
  }
}
