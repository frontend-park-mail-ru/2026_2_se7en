import { loadTemplate } from '../../helpers/LoadTemplate.js';
import { BannerErrorIcon, SpinnerIcon } from '../core/Icons.js';
import { Field } from './Field.js';

let templates = {};

/**
 * Генерирует разметку карточки формы авторизации.
 *
 * @param {Object} params
 * @returns {Promise<string>}
 */
export async function AuthForm({
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
  const fieldsHtml = [];
  for (const field of fields) {
    fieldsHtml.push(await Field(field));
  }

  templates = await loadTemplate(templates, 'auth-form');
  return templates['auth-form']({
    formId,
    submitId,
    title,
    subtitle,
    fieldsHtml: fieldsHtml.join(''),
    submitText,
    footer,
    generalError,
    generalErrorHint,
    loading,
    bannerErrorIcon: BannerErrorIcon,
    spinnerIcon: SpinnerIcon,
  });
}
