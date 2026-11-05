import './Button.scss';
import { renderAttrs } from '@/helpers/RenderAttrs.ts';

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
  const modeClasses: Record<NonNullable<ButtonParams['mode']>, string> = {
    primary: 'button_primary',
    secondary: 'button_secondary',
    ghost: 'button_ghost',
  };

  const modeClass = modeClasses[mode] || modeClasses.primary;
  const idAttr = id ? `id="${id}"` : '';
  const ariaLabelAttr = ariaLabel ? `aria-label="${ariaLabel}"` : '';
  const titleAttr = title ? `title="${title}"` : '';
  const disabledAttr = disabled ? 'disabled' : '';
  const attrsHtml = renderAttrs(attrs);
  const iconBeforeHtml = iconBefore ? `<span class="button__icon">${iconBefore}</span>` : '';
  const iconAfterHtml = iconAfter ? `<span class="button__icon">${iconAfter}</span>` : '';
  const finalClasses = `button ${modeClass} ${className}`.trim();

  return `
        <button ${idAttr} ${ariaLabelAttr} ${titleAttr} ${disabledAttr} type="${type}" class="${finalClasses}">
                        ${iconBeforeHtml}${text}${iconAfterHtml}
        </button>
    `;
}
