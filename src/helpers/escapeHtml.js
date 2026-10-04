/**
 * Экранирует HTML-специальные символы для предотвращения XSS-атак
 * @param {string} value - Строка для экранирования
 * @returns {string} Экранированная строка
 */
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
})[char]);
}
