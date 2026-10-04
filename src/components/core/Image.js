/**
 * Универсальный компонент изображения
 * 
 * @param {Object} params - Параметры изображения
 * @param {string} params.src - Путь к изображению
 * @param {string} params.alt - Альтернативный текст
 * @param {string} [params.className] - Дополнительные CSS-классы
 * @param {'default' | 'pointer' | 'not-allowed' | 'none'} [params.cursor='default'] - Тип курсора
 * @param {boolean} [params.lazy=false] - Использовать ленивую загрузку
 * @param {string} [params.width] - Ширина изображения
 * @param {string} [params.height] - Высота изображения
 * @returns {string} HTML-строка с изображением
 */
export function Image({ 
    src, 
    alt, 
    className = '', 
    cursor = 'default',
    lazy = false,
    width = '',
    height = '',
}) {
    const cursorClasses = {
        default: '',
        pointer: 'cursor-pointer',
        'not-allowed': 'cursor-not-allowed',
        none: 'cursor-none',
    };

    const lazyAttr = lazy ? 'loading="lazy"' : '';
    const sizeClasses = [width, height].filter(Boolean).join(' ');

    return `
        <img 
            src="${src}" 
            alt="${alt}" 
            class="${sizeClasses} ${cursorClasses[cursor]} ${className}"
            ${lazyAttr}
        />
    `;
}
