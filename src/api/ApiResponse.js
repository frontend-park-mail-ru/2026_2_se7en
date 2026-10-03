/**
 * Класс успешного ответа от сервера
 */
export class ApiSuccess {
  /**
   * @param {any} data - Данные от сервера
   * @param {number} status - HTTP статус
   */
  constructor(data, status) {
    this.success = true;
    this.data = data;
    this.status = status;
  }
}

/**
 * Класс ошибки ответа от сервера или сети
 */
export class ApiError {
  /**
   * @param {string} code - Код ошибки
   * @param {string} message - Человекочитаемое сообщение об ошибке
   * @param {number} status - HTTP статус
   * @param {ErrorDetail[] | null} [details] - Дополнительные детали ошибки валидации
   */
  constructor(code, message, status, details = null) {
    this.success = false;
    this.code = code;
    this.message = message;
    this.status = status;
    this.details = details;
  }
}
