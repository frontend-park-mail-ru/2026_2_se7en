import { VALIDATION_RULES } from './register.constants.js';

/**
 * Валидирует поля формы на основе правил из VALIDATION_RULES
 * 
 * @param {number} currentStep - Текущий шаг формы (1 или 2)
 * @param {Object} getFieldValue - Функция, возвращающая значение поля по его ID
 * @returns {{ isValid: boolean, errors: Array<{field: string, reason: string}>, fieldErrors: Object }}
 */
export function validateForm(currentStep, getFieldValue) {
    const fieldErrors = {};
    const errors = [];

    const fieldsToValidate = currentStep === 1
        ? ['first_name', 'last_name']
        : ['nickname', 'email', 'password', 'phone_number'];

    for (const field of fieldsToValidate) {
        const rules = VALIDATION_RULES[field];
        const value = getFieldValue(field);

        if (field === 'phone_number' && !value) {
            continue;
        }

        if (rules.required && !value) {
            fieldErrors[field] = 'required';
            errors.push({ field, reason: 'required' });
            continue;
        }

        if (value) {
            if (rules.minLength && value.length < rules.minLength) {
                fieldErrors[field] = `length_must_be_${rules.minLength}_to_${rules.maxLength}`;
                errors.push({ field, reason: `length_must_be_${rules.minLength}_to_${rules.maxLength}` });
            } else if (rules.maxLength && value.length > rules.maxLength) {
                fieldErrors[field] = 'max_length_exceeded';
                errors.push({ field, reason: 'max_length_exceeded' });
            } else if (rules.pattern && !rules.pattern.test(value)) {
                fieldErrors[field] = 'invalid_format';
                errors.push({ field, reason: 'invalid_format' });
            }
        }
    }

    return { isValid: errors.length === 0, errors, fieldErrors };
}
