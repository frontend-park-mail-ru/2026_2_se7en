import { loadTemplate } from '../../helpers/LoadTemplate.js';
import { debugError } from '../../helpers/debugError.js';
import { BannerErrorIcon, SpinnerIcon } from '../core/Icons.js';
import { Field } from './Field.js';

let templates = {};

/** Загружает шаблон карточки формы авторизации. */
export async function loadAuthFormTemplate() {
  templates = await loadTemplate(templates, 'auth-form');
}

/**
 * Генерирует разметку карточки формы авторизации.
 * @param {Object} params Параметры формы.
 * @returns {string} HTML-разметка формы.
 */
export function AuthForm({
  formId,
  submitId,
  title,
  subtitle,
  fields,
  submitText,
  footer,
  generalError = '',
  generalErrorHint = '',
  loading = false,
}) {
  if (!templates['auth-form']) {
    debugError('Шаблон формы авторизации ещё не загружен');
    return '';
  }

  const fieldsHtml = fields.map((field) => Field(field)).join('');
  return templates['auth-form']({
    formId,
    submitId,
    title,
    subtitle,
    fieldsHtml,
    submitText,
    footer,
    generalError,
    generalErrorHint,
    loading,
    bannerErrorIcon: BannerErrorIcon,
    spinnerIcon: SpinnerIcon,
  });
}
