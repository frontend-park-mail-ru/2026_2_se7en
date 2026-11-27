import './Tooltip.scss';

const TOOLTIP_ATTR = 'data-tooltip';
const MIN_VIEWPORT_PADDING_PX = 8;

let tooltipElement: HTMLElement | null = null;

/**
 * Создаёт единственный элемент тултипа и прикрепляет его к body.
 */
function createTooltip(): HTMLElement {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  document.body.append(tooltip);
  return tooltip;
}

/** Скрывает тултип. */
function hideTooltip(): void {
  tooltipElement?.classList.remove('tooltip_visible');
}

/**
 * Показывает тултип над элементом по центру с учётом краёв экрана.
 * Если элемент у верхней кромки - тултип переворачивается вниз.
 */
function showTooltip(host: Element): void {
  if (host.scrollWidth <= host.clientWidth) {
    return;
  }

  if (!tooltipElement) {
    tooltipElement = createTooltip();
  }
  const tooltip = tooltipElement;
  tooltip.textContent = host.getAttribute(TOOLTIP_ATTR) ?? '';

  const rect = host.getBoundingClientRect();
  const flipBelow = rect.top < 48;
  const halfWidth = tooltip.offsetWidth / 2;
  const left = Math.min(
    Math.max(rect.left + rect.width / 2, halfWidth + MIN_VIEWPORT_PADDING_PX),
    window.innerWidth - halfWidth - MIN_VIEWPORT_PADDING_PX,
  );

  tooltip.classList.toggle('tooltip_below', flipBelow);
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${flipBelow ? rect.bottom : rect.top}px`;
  tooltip.classList.add('tooltip_visible');
}

/**
 * Включает кастомные тултипы по всему приложению.
 */
export function bindTooltips(): void {
  document.addEventListener('mouseover', (event) => {
    const host = (event.target as Element | null)?.closest(`[${TOOLTIP_ATTR}]`);
    if (host) {
      showTooltip(host);
    }
  });

  document.addEventListener('mouseout', (event) => {
    const host = (event.target as Element | null)?.closest(`[${TOOLTIP_ATTR}]`);
    if (!host) {
      return;
    }
    hideTooltip();
  });

  document.addEventListener('scroll', hideTooltip, true);
  window.addEventListener('resize', hideTooltip);
}
