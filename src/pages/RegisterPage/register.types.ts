import type { RegisterFieldErrors, RegisterField } from '@/api/auth/auth.types';

export type ValidationReason =
  | 'required'
  | 'nickname_already_exists'
  | 'nickname_length'
  | 'nickname_invalid_format'
  | 'password_length'
  | 'email_already_exists'
  | 'email_max_length'
  | 'email_invalid_format'
  | 'first_name_max_length'
  | 'contains_emoji'
  | 'contains_invalid_chars'
  | 'invalid_format';

export interface FieldValidationError {
  field: RegisterField;
  reason: ValidationReason;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FieldValidationError[];
  fieldErrors: RegisterFieldErrors;
}

export interface ValidationRule {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}
