export interface ImageParams {
  src: string;
  alt: string;
  className?: string;
  cursor?: 'default' | 'pointer' | 'not-allowed' | 'none';
  lazy?: boolean;
  width?: string;
  height?: string;
}

/**
 * Универсальный компонент изображения
 */
export function Image({
  src,
  alt,
  className = '',
  cursor = 'default',
  lazy = false,
  width = '',
  height = '',
}: ImageParams): string {
  const cursorClasses: Record<NonNullable<ImageParams['cursor']>, string> = {
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
