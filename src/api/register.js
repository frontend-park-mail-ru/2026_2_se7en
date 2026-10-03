import { ERROR_STATUSES } from '../pages/register/register.constants.js';

/**
 * Отправляет запрос на регистрацию пользователя
 * 
 * @param {RegisterData} userData - Данные пользователя для регистрации
 * @returns {Promise<ApiResult>} Результат запроса
 */
export async function registerUser(userData) {
    try {
        const response = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (response.status === ERROR_STATUSES.StatusCreated) {
            return {
                success: true,
                status: response.status,
                data,
            };
        }

        if (response.status === ERROR_STATUSES.StatusBadRequest && data.code === 'VALIDATION_ERROR') {
            return {
                success: false,
                status: response.status,
                code: data.code,
                message: data.message,
                details: data.details,
            };
        }

        if (response.status === ERROR_STATUSES.StatusConflict) {
            return {
                success: false,
                status: response.status,
                code: data.code,
                message: data.message,
                details: data.details,
            };
        }

        return {
            success: false,
            status: response.status,
            code: data.code || 'UNKNOWN_ERROR',
            message: data.message || 'Произошла ошибка при регистрации',
        };
    } catch (error) {
        return {
            success: false,
            status: 0,
            code: 'NETWORK_ERROR',
            message: 'Не удалось отправить данные',
        };
    }
}
