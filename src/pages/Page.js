import { APP_ID } from '../constants/App.js';
import { debugError } from '../helpers/debugError.js';

let mountedPage = null;

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
     * @returns {Promise<boolean>} true если контейнер найден, иначе false
     */
    async mount() {
        if (mountedPage && mountedPage !== this) {
            mountedPage.unmount();
        }

        this.container = document.getElementById(APP_ID);
        if (!this.container) {
            debugError(`Элемент с id ${APP_ID} не найден`);
            return false;
        }

        mountedPage = this;
        this.container.innerHTML = await this.render();
        this.bindEvents();
        await this.afterMount();
        return true;
    }

    render() {
        return '';
    }

    bindEvents() {}

    async afterMount() {}

    /**
     * Очищает ресурсы страницы
     */
    unmount() {
        this.container = null;
        if (mountedPage === this) {
            mountedPage = null;
        }
    }
}
