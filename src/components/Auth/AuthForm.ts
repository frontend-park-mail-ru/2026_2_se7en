import { type Templates, loadTemplate } from '@/helpers/LoadTemplate.js';
import { debugError } from '@/helpers/DebugError.js';
import { BannerErrorIcon, SpinnerIcon } from '@/components/core/Icons.js';
import { Field, type FieldParams } from './Field.js';
import type { Signal } from '@/reactive/Signal';

export interface AuthFormParams {
  formId: string;
  submitId: string;
  title: string;
  subtitle: string;
  fields: FieldParams[];
  submitText: string;
  footer: string;
  generalError: Signal<string>;
  generalErrorHint: Signal<string>;
  loading: Signal<boolean>;
}

let templates: Templates = {};

/** Загружает шаблон карточки формы авторизации. */
export async function loadAuthFormTemplate(): Promise<void> {
  templates = await loadTemplate(templates, 'auth-form');
}

/**
 * Генерирует разметку карточки формы авторизации.
 */
export function AuthForm({
  formId,
  submitId,
  title,
  subtitle,
  fields,
  submitText,
  footer,
  generalError,
  generalErrorHint,
  loading,
}: AuthFormParams): string {
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
    generalError: generalError.get(),
    generalErrorHint: generalErrorHint.get(),
    loading: loading.get(),
    bannerErrorIcon: BannerErrorIcon,
    spinnerIcon: SpinnerIcon,
  });
}
