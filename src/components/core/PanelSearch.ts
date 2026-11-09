import './PanelSearch.scss';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';

/** Поле поиска в боковой панели. */
export function PanelSearch(options: {
  label: string;
  placeholder: string;
  value?: string;
  name?: string;
  disabled?: boolean;
}): string {
  return `
    <label class="panel-search">
      <svg class="panel-search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" stroke-width="1.8"/>
        <path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
      <input type="search" aria-label="${escapeHtml(options.label)}" placeholder="${escapeHtml(options.placeholder)}" value="${escapeHtml(options.value ?? '')}" ${options.name ? `name="${escapeHtml(options.name)}"` : ''} ${options.disabled ? 'disabled' : ''} autocomplete="off">
    </label>
  `;
}
