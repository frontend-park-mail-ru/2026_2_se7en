/**
 * Экранирует текст перед вставкой в HTML-разметку.
 * @param {unknown} value Значение для экранирования.
 * @returns {string} Экранированная строка.
 */
export function escapeHTML(value) {
  const characters = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return String(value).replace(/[&<>"']/g, (character) => characters[character]);
}
