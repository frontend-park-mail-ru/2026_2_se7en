import { APP_ID } from '../constants/App.js';
import { debugError } from '../helpers/error.js';

/**
 * Базовый класс для всех страниц приложения
 * Предоставляет общую логику инициализации и работы с DOM
 */
export class Page {
    constructor() {
        this.container = null;
    }

    /**
     * Инициализирует страницу: находит контейнер и подготавливает DOM
     * @returns {boolean} true если контейнер найден, иначе false
     */
    mount() {
        this.container = document.getElementById(APP_ID);
        if (!this.container) {
            debugError(`Элемент с id ${APP_ID} не найден`);
            return false;
        }
        return true;
    }

    /**
     * Очищает ресурсы страницы
     */
    unmount() {
        this.container = null;
    }
}
