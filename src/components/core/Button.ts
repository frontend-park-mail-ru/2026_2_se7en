import { escapeHtml } from '@/helpers/EscapeHtml.ts';

export interface ButtonParams {
  text: string;
  id?: string;
  mode?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  iconBefore?: string;
  iconAfter?: string;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  title?: string;
  disabled?: boolean;
  attrs?: Record<string, string>;
}

/**
 * Генерирует HTML-разметку для кнопки.
 */
export function Button({
  text,
  id,
  mode = 'primary',
  className = '',
  iconBefore = '',
  iconAfter = '',
  type = 'button',
  ariaLabel = '',
  title = '',
  disabled = false,
  attrs = {},
}: ButtonParams): string {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1';

  const variants: Record<NonNullable<ButtonParams['mode']>, string> = {
    primary:
      'px-6 py-2 rounded-xl bg-black text-white hover:bg-gray-900 shadow-md hover:shadow-lg focus:ring-gray-500',
    secondary:
      'px-6 py-2 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400',
    ghost: 'bg-transparent text-gray-900 hover:text-gray-600 border-none focus:ring-gray-300',
  };

  const modeClasses = variants[mode] || variants.primary;
  const idAttr = id ? `id="${id}"` : '';
  const ariaLabelAttr = ariaLabel ? `aria-label="${ariaLabel}"` : '';
  const titleAttr = title ? `title="${title}"` : '';
  const disabledAttr = disabled ? 'disabled' : '';
  const attrsHtml = Object.entries(attrs)
    .map(([name, value]) => `${name}="${escapeHtml(value)}"`)
    .join(' ');
  const iconBeforeHtml = iconBefore
    ? `<span class="inline-flex items-center">${iconBefore}</span>`
    : '';
  const iconAfterHtml = iconAfter
    ? `<span class="inline-flex items-center">${iconAfter}</span>`
    : '';
  const finalClasses = `${baseClasses} ${modeClasses} ${className}`.trim();

  return `
        <button ${idAttr} ${ariaLabelAttr} ${titleAttr} ${attrsHtml} ${disabledAttr} type="${type}" class="${finalClasses}">
                        ${iconBeforeHtml}${text}${iconAfterHtml}
        </button>
    `;
}
