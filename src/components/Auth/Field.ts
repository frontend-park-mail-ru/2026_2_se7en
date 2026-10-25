import { debugError } from '@/helpers/DebugError.js';
import { EyeClosedIcon, EyeOpenIcon, FieldErrorIcon } from '@/components/core/Icons.js';
import { type Templates, loadTemplate } from '@/helpers/LoadTemplate.js';

export interface FieldParams {
  id: string;
  name: string;
  type?: string;
  label: string;
  placeholder?: string;
  value?: string;
  error?: string;
}

let templates: Templates = {};
const authEyeClosedIcon = EyeClosedIcon.replace('class="w-5 h-5"', 'class="w-5 h-5 hidden"');
const authEyeOpenIcon = EyeOpenIcon.replace('class="w-5 h-5 hidden"', 'class="w-5 h-5"');

/** Загружает шаблон поля авторизации. */
export async function loadFieldTemplate(): Promise<void> {
  templates = await loadTemplate(templates, 'field');
}

/**
 * Генерирует HTML-разметку поля ввода.
 */
export function Field({
  id,
  name,
  type = 'text',
  label,
  placeholder = '',
  value = '',
  error = '',
}: FieldParams): string {
  if (!templates.field) {
    debugError('Шаблон поля авторизации ещё не загружен');
    return '';
  }

  return templates.field({
    id,
    name,
    type,
    label,
    placeholder,
    value,
    error,
    isPassword: type === 'password',
    eyeClosedIcon: authEyeClosedIcon,
    eyeOpenIcon: authEyeOpenIcon,
    fieldErrorIcon: FieldErrorIcon,
  });
}
