/**
 * Генерирует HTML-разметку для кнопки.
 *
 * @param {Object} params - Параметры кнопки.
 * @param {string} params.text - Текст, отображаемый на кнопке.
 * @param {string} [params.id] - Уникальный идентификатор элемента (необязательно).
 * @param {'primary' | 'secondary'} [params.mode='primary'] - Вариант стилизации кнопки.
 * @param {string} [params.className=''] - Дополнительные CSS-классы.
 * @param {string} [params.icon=''] - HTML-код иконки (необязательно).
 * @returns {string} HTML-строка с разметкой кнопки.
 */
export function Button({ text, id, mode = 'primary', className = '', icon = '' }) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';

  const variants = {
    primary:
      'px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-900 shadow-md hover:shadow-lg focus:ring-gray-500',
    secondary:
      'px-6 py-2 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400',
  };

  const modeClasses = variants[mode] || '';
  const idAttr = id ? `id="${id}"` : '';
  const finalClasses = `${baseClasses} ${modeClasses} ${className}`.trim();

  return `
    <button ${idAttr} class="${finalClasses}">
      ${text}
      ${icon}
    </button>
  `;
}
