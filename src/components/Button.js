/**
 * Генерирует HTML-разметку для кнопки.
 *
 * @param {Object} params - Параметры кнопки.
 * @param {string} params.text - Текст, отображаемый на кнопке.
 * @param {string} [params.id] - Уникальный идентификатор элемента.
 * @param {'primary' | 'secondary' | 'ghost'} [params.mode='primary'] - Вариант стилизации.
 * @param {string} [params.className] - Дополнительные CSS-классы.
 * @param {string} [params.iconBefore] - SVG иконка перед текстом.
 * @param {string} [params.iconAfter] - SVG иконка после текста.
 * @param {'button' | 'submit' | 'reset'} [params.type='button'] - Тип кнопки.
 * @returns {string} HTML-строка с разметкой кнопки.
 */
export function Button({
    text,
    id,
    mode = 'primary',
    className = '',
    iconBefore = '',
    iconAfter = '',
    type = 'button',
}) {
    const baseClasses =
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1';

    const variants = {
        primary:
            'px-6 py-2 rounded-xl bg-black text-white hover:bg-gray-900 shadow-md hover:shadow-lg focus:ring-gray-500',
        secondary:
            'px-6 py-2 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400',
        ghost:
            'bg-transparent text-gray-900 hover:text-gray-600 border-none focus:ring-gray-300',
    };

    const modeClasses = variants[mode] || variants.primary;
    const idAttr = id ? `id="${id}"` : '';
    const iconBeforeHtml = iconBefore
        ? `<span class="inline-flex items-center">${iconBefore}</span>`
        : '';
    const iconAfterHtml = iconAfter
        ? `<span class="inline-flex items-center">${iconAfter}</span>`
        : '';
    const finalClasses = `${baseClasses} ${modeClasses} ${className}`.trim();

    return `
        <button ${idAttr} type="${type}" class="${finalClasses}">
            ${iconBeforeHtml}${text}${iconAfterHtml}
        </button>
    `;
}
