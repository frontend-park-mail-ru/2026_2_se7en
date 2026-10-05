import { ApiSuccess } from '../ApiResponse.js';

/**
 * Мок-спецификация OpenAPI.
 * Возвращает готовый объект спецификации.
 */
export const MOCK_SWAGGER_SPEC = {
  openapi: '3.0.3',
  info: {
    title: 'API регистрации и авторизации',
    version: '1.0.0',
  },
  tags: [{ name: 'Auth', description: 'Операции регистрации и авторизации' }],
  paths: {
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        operationId: 'register',
        summary: 'Регистрация',
        description: 'Регистрация пользователя',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Регистрация прошла успешно' },
          400: { description: 'Ошибка валидации' },
          409: { description: 'Email или никнейм заняты' },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        operationId: 'login',
        summary: 'Вход',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Успешный вход' },
          401: { description: 'Неверный email или пароль' },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        operationId: 'logout',
        summary: 'Выход',
        responses: {
          204: { description: 'Сессия удалена' },
          401: { description: 'Сессия недействительна' },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        operationId: 'getCurrentUser',
        summary: 'Текущий пользователь',
        responses: {
          200: { description: 'Пользователь получен' },
          401: { description: 'Не авторизован' },
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          profile: { $ref: '#/components/schemas/Profile' },
        },
      },
      Profile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          nickname: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string', nullable: true },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'nickname'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8, maxLength: 16 },
          nickname: { type: 'string', minLength: 3, maxLength: 16 },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
    },
  },
};

/**
 * Мок-ответ на запрос получения спецификации Swagger.
 *
 * @returns {Promise<ApiSuccess>} Успешный ответ с объектом спецификации.
 */
export async function mockGetSwaggerSpec() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return new ApiSuccess(MOCK_SWAGGER_SPEC, 200);
}
