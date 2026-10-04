import { loadTemplate } from '../../helpers/LoadTemplate.js';
import { debugError } from '../../helpers/debugError.js';
import { EyeClosedIcon, EyeOpenIcon, FieldErrorIcon } from '../core/Icons.js';

let templates = {};
const authEyeClosedIcon = EyeClosedIcon.replace('class="w-5 h-5"', 'class="w-5 h-5 hidden"');
const authEyeOpenIcon = EyeOpenIcon.replace('class="w-5 h-5 hidden"', 'class="w-5 h-5"');

/** Загружает шаблон поля авторизации. */
export async function loadFieldTemplate() {
  templates = await loadTemplate(templates, 'field');
}

/**
 * Генерирует HTML-разметку поля ввода.
 * @param {Object} params Параметры поля.
 * @returns {string} HTML-разметка поля.
 */
export function Field({
  id,
  name,
  type = 'text',
  label,
  placeholder = '',
  value = '',
  error = '',
}) {
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
