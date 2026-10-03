export const ELEMENT_IDS = {
    FORM: 'register_form',
    EMAIL: 'email',
    PASSWORD: 'password',
    PHONE_NUMBER: 'phone_number',
    NICKNAME: 'nickname',
    FIRST_NAME: 'first_name',
    LAST_NAME: 'last_name',
    SUBMIT_BUTTON: 'submit-btn',
    ERROR_CONTAINER: 'error-container',
    ERROR_MESSAGE: 'error-message',
};

export const VALIDATION_RULES = {
    email: {
        required: true,
        maxLength: 255,
        pattern: /^[a-zA-Z0-9_]+@[a-zA-Z]\.[a-zA-Z]{2,}$/
    },
    password: {
        required: true,
        minLength: 8,
        maxLength: 16
    },
    nickname: {
        required: true,
        minLength: 3,
        maxLength: 16,
        pattern: /^[a-zA-Z0-9_]+$/
    },
    phone_number: {
        required: false,
        pattern: /^\+?[1-9]\d{1,14}$/
    },
    first_name: {
        required: true,
        maxLength: 32
    },
    last_name: {
        required: true,
        maxLength: 32
    },
};

export const ERROR_MESSAGES = {
    required: 'Обязательное поле',
    invalid_format: 'Неверный формат',
    max_length_exceeded: 'Превышена максимальная длина',
    length_must_be_8_to_16: 'Длина должна быть от 8 до 16 символов',
    length_must_be_3_to_16: 'Длина должна быть от 3 до 16 символов',
    already_exists: 'Уже используется',
};

export const ERROR_STATUSES = {
    StatusCreated: 201,
    StatusBadRequest: 400,
    StatusConflict: 409,
}
