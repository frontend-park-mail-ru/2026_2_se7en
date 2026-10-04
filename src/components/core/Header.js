/**
 * Генерирует HTML-разметку для шапки страницы (Header).
 *
 * @param {Object} params - Параметры шапки.
 * @param {string} params.title - Заголовок, который будет отображен в шапке.
 * @returns {string} HTML-строка с разметкой шапки.
 */
export function Header({ title }) {
  return `
    <header class="w-full p-4 bg-white shadow-sm">
      <h1 class="text-2xl font-bold text-blue-600 text-center">${title}</h1>
    </header>
  `;
}
