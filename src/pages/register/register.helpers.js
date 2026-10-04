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
    if (field === 'first_name' && normalized.includes('maximum length')) {
        return 'first_name_max_length';
    }

    return 'invalid_format';
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
        const rules = VALIDATION_RULES[field];
        const value = getFieldValue(field);

        if (rules.required && !value) {
            fieldErrors[field] = 'required';
            errors.push({ field, reason: 'required' });
            continue;
        }

        if (value) {
            if (rules.minLength && value.length < rules.minLength) {
                const reason = field === 'nickname' ? 'nickname_length' : 'password_length';
                fieldErrors[field] = reason;
                errors.push({ field, reason });
            } else if (rules.maxLength && value.length > rules.maxLength) {
                const reason = field === 'nickname' || field === 'password'
                    ? `${field}_length`
                    : `${field}_max_length`;
                fieldErrors[field] = reason;
                errors.push({ field, reason });
            } else if (rules.pattern && !rules.pattern.test(value)) {
                const reason = field === 'nickname' ? 'nickname_invalid_format' : `${field}_invalid_format`;
                fieldErrors[field] = reason;
                errors.push({ field, reason });
            }
        }
    }

    return { isValid: errors.length === 0, errors, fieldErrors };
}
