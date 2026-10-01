/**
 * Генерирует HTML-разметку для кнопки.
 *
 * @param {Object} params - Параметры кнопки.
 * @param {string} params.text - Текст, отображаемый на кнопке.
 * @param {string} [params.id] - Уникальный идентификатор элемента (необязательно).
 * @param {'primary' | 'secondary'} [params.mode='primary'] - Вариант стилизации кнопки.
 * @returns {string} HTML-строка с разметкой кнопки.
 */
export function Button({ text, id, mode = 'primary' }) {
  const baseStyle = 'px-6 py-2 rounded-lg font-medium transition-all duration-200';
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  const idAttr = id ? `id="${id}"` : '';

  return `
    <button ${idAttr} class="${baseStyle} ${variants[mode]}">
      ${text}
    </button>
  `;
}
