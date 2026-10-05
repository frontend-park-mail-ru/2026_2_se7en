import { SwaggerApi } from '../../api/swagger/SwaggerApi.js';
import { ApiError } from '../../api/ApiResponse.js';
import { ERROR_CODES } from '../../api/error.constants.js';
import { debugError } from '../../helpers/debugError.js';
import { ROUTES } from '../../constants/Routes.js';
import { Page } from '../Page.js';

/**
 * Класс, представляющий страницу документации API (Swagger).
 */
export class SwaggerPage extends Page {
  static route = ROUTES.SWAGGER;

  constructor() {
    super();
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    this.swaggerUi = null;
  }

  render() {
    if (this.isLoading) {
      return `
        <div class="min-h-screen bg-gray-50 flex items-center justify-center">
          <div class="text-center">
            <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-600">Загрузка документации...</p>
          </div>
        </div>
      `;
    }

    if (this.hasError) {
      return `
        <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md text-center">
            <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h2 class="text-xl font-bold text-gray-900 mb-2">Ошибка загрузки документации</h2>
            <p class="text-gray-600 mb-6">${this.errorMessage}</p>
            <button 
              id="retry-swagger-btn" 
              class="px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-900 transition-colors"
            >
              Попробовать ещё раз
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="min-h-screen bg-gray-50">
        <div class="max-w-7xl mx-auto p-4">
          <div id="swagger-container" class="bg-white rounded-lg shadow-sm min-h-[80vh]"></div>
        </div>
      </div>
    `;
  }

  /**
   * Загрузка спецификации через SwaggerApi
   */
  async loadSwaggerSpec() {
    this.isLoading = true;
    this.hasError = false;
    await this.update();

    const response = await SwaggerApi.getSpec();

    if (response instanceof ApiError) {
      this.isLoading = false;
      this.hasError = true;

      switch (response.code) {
        case ERROR_CODES.NETWORK_ERROR:
          this.errorMessage = 'Нет подключения к серверу документации';
          break;
        default:
          this.errorMessage = response.message || 'Не удалось загрузить документацию';
      }

      debugError(response.message);
      await this.update();
      return;
    }

    this.isLoading = false;
    await this.update();

    this.initSwaggerUI(response.data);
  }

  /**
   * Инициализация Swagger UI
   */
  initSwaggerUI(specObject) {
    const container = document.getElementById('swagger-container');
    if (!container) return;

    this.swaggerUi = SwaggerUIBundle({
      spec: specObject,
      dom_id: '#swagger-container',
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: 'StandaloneLayout',
      docExpansion: 'list',
      filter: true,
    });
  }

  bindEvents() {
    const retryButton = document.getElementById('retry-swagger-btn');
    if (retryButton) {
      retryButton.addEventListener('click', () => this.loadSwaggerSpec());
    }
  }

  async afterMount() {
    await this.loadSwaggerSpec();
  }

  beforeUnmount() {
    if (this.swaggerUi) {
      const container = document.getElementById('swagger-container');
      if (container) {
        container.innerHTML = '';
      }
      this.swaggerUi = null;
    }
  }
}
