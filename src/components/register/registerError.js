/**
 * Компонент блока общей ошибки
 * @param {string|null} generalError - текст ошибки (если ошибки нет - null)
 */
export function renderRegisterError(generalError) {
  if (!generalError) return '';

  const safeMessage = String(generalError).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);

  return `
        <div id="error-container" class="absolute -top-8 left-0 right-0 z-10 bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg">
            <div class="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 flex-shrink-0 text-red-600">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <div>
                    <p class="text-red-800 text-sm font-medium">Не удалось отправить данные</p>
                    <p class="text-red-600 text-xs mt-0.5">${safeMessage}</p>
                </div>
            </div>
        </div>
    `;
}
