import { escapeHtml } from '../../helpers/escapeHtml.js';

/**
 * Компонент блока общей ошибки
 * @param {string|null} generalError - текст ошибки (если ошибки нет - null)
 */
export function renderRegisterError(generalError) {
  if (!generalError) return '';

  const safeMessage = escapeHtml(generalError);

  return `
        <div id="error-container" role="alert" aria-live="assertive" class="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg">
            <div class="flex items-start gap-3">
                ${BannerErrorIcon}
                <div>
                    <p class="text-red-800 text-sm font-medium">Не удалось отправить данные</p>
                    <p class="text-red-600 text-xs mt-0.5">${safeMessage}</p>
                </div>
            </div>
        </div>
    `;
}
