import { VALIDATION_RULES } from './register.constants.js';

export function normalizeValidationReason(field, reason) {
    const normalized = String(reason).toLowerCase();

    if (normalized.includes('required')) return 'required';
    if (field === 'nickname') {
        if (normalized.includes('already exists')) return 'nickname_already_exists';
        if (normalized.includes('length')) return 'nickname_length';
        if (normalized.includes('format')) return 'nickname_invalid_format';
    }
    if (field === 'password' && normalized.includes('length')) return 'password_length';
    if (field === 'email') {
        if (normalized.includes('already exists')) return 'email_already_exists';
        if (normalized.includes('maximum length')) return 'email_max_length';
        if (normalized.includes('format')) return 'email_invalid_format';
    }
    if (field === 'first_name' && normalized.includes('length')) {
        return `${field}_length`;
    }
    if (field === 'first_name' && (normalized.includes('digit') || normalized.includes('number'))) {
        return 'first_name_invalid_format';
    }

    return 'invalid_format';
}

export function validateField(field, value) {
    const rules = VALIDATION_RULES[field];
    if (!rules) return '';

    const normalizedValue = field === 'password' ? value : value.trim();
    if (rules.required && !normalizedValue) return 'required';
    if (!normalizedValue) return '';

    const length = field === 'first_name'
        ? Array.from(normalizedValue).length
        : normalizedValue.length;

    if (field === 'first_name' && rules.pattern && !rules.pattern.test(normalizedValue)) {
        return `${field}_invalid_format`;
    }
    if (rules.minLength && length < rules.minLength) return `${field}_length`;
    if (rules.maxLength && length > rules.maxLength) {
        return field === 'email' ? 'email_max_length' : `${field}_length`;
    }
    if (rules.pattern && !rules.pattern.test(normalizedValue)) return `${field}_invalid_format`;

    return '';
}

/**
 * Валидирует поля формы на основе правил из VALIDATION_RULES
 * 
 * @param {Object} getFieldValue - Функция, возвращающая значение поля по его ID
 * @returns {{ isValid: boolean, errors: Array<{field: string, reason: string}>, fieldErrors: Object }}
 */
export function validateForm(getFieldValue) {
    const fieldErrors = {};
    const errors = [];

    const fieldsToValidate = ['first_name', 'nickname', 'email', 'password'];

    for (const field of fieldsToValidate) {
        const reason = validateField(field, getFieldValue(field));
        if (reason) {
            fieldErrors[field] = reason;
            errors.push({ field, reason });
        }
    }

    return { isValid: errors.length === 0, errors, fieldErrors };
}
