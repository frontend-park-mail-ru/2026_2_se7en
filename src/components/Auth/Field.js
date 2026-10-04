import { loadTemplate } from '../../helpers/LoadTemplate.js';
import { EyeClosedIcon, EyeOpenIcon, FieldErrorIcon } from '../core/Icons.js';

let templates = {};
const authEyeClosedIcon = EyeClosedIcon.replace('class="w-5 h-5"', 'class="w-5 h-5 hidden"');
const authEyeOpenIcon = EyeOpenIcon.replace('class="w-5 h-5 hidden"', 'class="w-5 h-5"');

/**
 * Генерирует разметку поля ввода для формы авторизации.
 *
 * @param {Object} params
 * @returns {Promise<string>}
 */
export async function Field({
  id,
  name,
  type = 'text',
  label,
  placeholder = '',
  value = '',
  error = '',
}) {
  templates = await loadTemplate(templates, 'field');
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
