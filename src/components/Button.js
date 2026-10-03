/**
 * Генерирует HTML-разметку для кнопки.
 *
 * @param {Object} params - Параметры кнопки.
 * @param {string} params.text - Текст, отображаемый на кнопке.
 * @param {string} [params.id] - Уникальный идентификатор элемента (необязательно).
 * @param {'primary' | 'secondary' | 'chatsList' } [params.mode='primary'] - Вариант стилизации кнопки.
 * @returns {string} HTML-строка с разметкой кнопки.
 */
export function Button({ text, id, mode = 'primary', icon = '' }) {
  const variants = {
    primary:
      'px-6 py-2 rounded-lg font-medium transition-all duration-200 inline-flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg',
    secondary:
      'px-6 py-2 rounded-lg font-medium transition-all duration-200 inline-flex items-center gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300',
    chatsList:
      'px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full hover:bg-gray-200',
  };

  const idAttr = id ? `id="${id}"` : '';

  return `
    <button ${idAttr} class="${variants[mode]}">
      ${text}
      ${icon}
    </button>
  `;
}
