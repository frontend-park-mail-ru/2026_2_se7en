import './Input.scss';
import type { InputParams } from './Input';
import { escapeHtml } from '@/helpers/EscapeHtml';
import { renderAttrs } from '@/helpers/RenderAttrs';

export function Textarea({
  id,
  name,
  value = '',
  placeholder = '',
  className = '',
  attrs = {},
}: Pick<InputParams, 'id' | 'name' | 'value' | 'placeholder' | 'className' | 'attrs'>): string {
  return `
    <div class="input ${escapeHtml(className)}">
      <textarea
        ${renderAttrs({ ...(id ? { id } : {}), ...(name ? { name } : {}), placeholder, ...attrs })}
        rows="4"
        class="input__field"
      >${escapeHtml(value)}</textarea>
    </div>
  `;
}
