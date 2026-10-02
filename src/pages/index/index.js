import { Header } from '../../components/Header.js';
import { Button } from '../../components/Button.js';
import { SERVER_STATUS, ELEMENT_IDS } from './index.constants.js';
import { APP_ID } from '../../constants/App.js';
import { handleError } from '../../helpers/error.js';
import { ApiError } from '../../helpers/ApiError.js';

/**
 * Класс, представляющий главную страницу приложения (PageIndex).
 * Отвечает за рендеринг разметки, управление состоянием и логику взаимодействия с сервером.
 */
export class PageIndex {
  constructor() {
    this.serverStatus = SERVER_STATUS.NOT_CHECKED;
    this.container = null;
  }

  render() {
    return `
      <div class="min-h-screen bg-gray-50 flex flex-col">
        ${Header({ title: 'sVyaZь и тОчка' })}
        
        <main class="flex-1 flex flex-col items-center justify-center p-6">
          <div class="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">
              Статус сервера:
            </h2>
            <p id="server-status" class="text-blue-600 font-mono mb-6 bg-blue-50 p-3 rounded">
              ${this.serverStatus}
            </p>
            
            <div class="flex gap-4 justify-center">
              ${Button({ id: ELEMENT_IDS.CHECK_BUTTON, text: 'Проверить API', mode: 'primary' })}
              ${Button({ id: ELEMENT_IDS.CLEAR_BUTTON, text: 'Очистить', mode: 'secondary' })}
              ${Button({ id: ELEMENT_IDS.TRIGGER_ERROR_BUTTON, text: 'Тест ошибки (Toast)', mode: 'danger' })}
            </div>
          </div>
        </main>
      </div>
    `;
  }

  mount() {
    this.container = document.getElementById(APP_ID);
    if (!this.container) {
      debugError(`Элемент с ${APP_ID} id не найден`);
      return;
    }
    this.container.innerHTML = this.render();
    this.bindEvents();
  }

  /**
   * Навешивает обработчики событий (click) на интерактивные элементы страницы.
   */
  bindEvents() {
    document.getElementById(ELEMENT_IDS.CHECK_BUTTON)?.addEventListener('click', () => {
      this.checkServer();
    });

    document.getElementById(ELEMENT_IDS.CLEAR_BUTTON)?.addEventListener('click', () => {
      this.clearStatus();
    });

    document.getElementById(ELEMENT_IDS.TRIGGER_ERROR_BUTTON)?.addEventListener('click', () => {
      this.triggerTestError();
    });
  }

  /**
   * Выполняет асинхронный запрос к API для проверки состояния сервера.
   * В случае успеха обновляет статус, в случае ошибки — логирует её и показывает сообщение.
   *
   * @async
   */
  async checkServer() {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      const data = await response.json();
      this.serverStatus = data.message;
      this.updateStatus();
    } catch (error) {
      this.serverStatus = SERVER_STATUS.ERROR;
      this.updateStatus();
    }
  }

  /**
   * Сбрасывает статус сервера в начальное состояние ("Не проверено") и обновляет UI.
   */
  clearStatus() {
    this.serverStatus = SERVER_STATUS.NOT_CHECKED;
    this.updateStatus();
  }

  /**
   * Обновляет текстовое содержимое элемента статуса на странице в соответствии с текущим состоянием.
   */
  updateStatus() {
    const statusElement = document.getElementById(ELEMENT_IDS.SERVER_STATUS);
    if (statusElement) {
      statusElement.textContent = this.serverStatus;
    }
  }

  triggerTestError() {
    try {
      throw new ApiError('VALIDATION_ERROR', 'Не удалось выполнить тестовый запрос', [
        { field: 'test_field', reason: 'fake_error' },
      ]);

      // throw new ApiError('NETWORK_ERROR', 'Сервер временно недоступен');
    } catch (error) {
      handleError(error);
    }
  }
}
