export interface ImageParams {
  src: string;
  alt: string;
  className?: string;
  lazy?: boolean;
}

/**
 * Универсальный компонент изображения
 */
export function Image({ src, alt, className = '', lazy = false }: ImageParams): string {
  const lazyAttr = lazy ? 'loading="lazy"' : '';

  return `
        <img
            src="${src}"
            alt="${alt}"
            class="${className}"
            ${lazyAttr}
        />
    `;
}
