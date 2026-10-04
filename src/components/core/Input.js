/**
 * Генерирует HTML-разметку для поля ввода.
 *
 * @param {Object} params - Параметры инпута.
 * @param {string} [params.placeholder=''] - Текст-подсказка.
 * @param {string} [params.id] - Уникальный идентификатор элемента.
 * @param {string} [params.name] - Имя элемента формы.
 * @param {string} [params.type='text'] - Тип инпута (text, password, email и т.д.).
 * @param {string} [params.value=''] - Начальное значение.
 * @param {string} [params.icon=''] - SVG-иконка (HTML-строка).
 * @param {'left' | 'right'} [params.iconPosition='left'] - Позиция иконки.
 * @param {string} [params.className=''] - Дополнительные CSS-классы.
 * @param {string} [params.inputClassName] - CSS-классы поля ввода вместо стандартных.
 * @returns {string} HTML-строка с разметкой инпута.
 */
export function Input({
  placeholder = '',
  id,
  name,
  type = 'text',
  value = '',
  icon = '',
  iconPosition = 'left',
  className = '',
  inputClassName = '',
}) {
  const baseStyle =
    'w-full py-2 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  const paddingClasses = {
    left: icon ? 'pl-10 pr-4' : 'px-4',
    right: icon ? 'pl-4 pr-10' : 'px-4',
  };

  const idAttr = id ? `id="${id}"` : '';
  const nameAttr = name ? `name="${name}"` : '';
  const valueAttr = value ? `value="${value}"` : '';
  const inputClasses = inputClassName || `${baseStyle} ${paddingClasses[iconPosition]}`;

  const iconHtml = icon
    ? `
    <svg class="w-5 h-5 text-gray-400 absolute ${
      iconPosition === 'left' ? 'left-3' : 'right-3'
    } top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      ${icon}
    </svg>
  `
    : '';

  return `
    <div class="relative ${className}">
      ${iconPosition === 'left' ? iconHtml : ''}
      <input 
        type="${type}" 
        ${idAttr}
        ${nameAttr}
        placeholder="${placeholder}" 
        ${valueAttr}
        class="${inputClasses}"
      >
      ${iconPosition === 'right' ? iconHtml : ''}
    </div>
  `;
}
