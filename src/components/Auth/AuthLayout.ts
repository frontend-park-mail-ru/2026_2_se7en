import { debugError } from '@/helpers/DebugError.js';
import { type Templates, loadTemplate } from '@/helpers/LoadTemplate.js';

export interface AuthLayoutParams {
  title: string;
  subtitle: string;
  topBar?: string;
  children: string;
}

let templates: Templates = {};

/** Загружает шаблон split-screen лейаута страниц авторизации. */
export async function loadAuthLayoutTemplate(): Promise<void> {
  templates = await loadTemplate(templates, 'auth-layout');
}

/**
 * Генерирует split-screen разметку для страниц авторизации.
 */
export function AuthLayout({ title, subtitle, topBar = '', children }: AuthLayoutParams): string {
  if (!templates['auth-layout']) {
    debugError('Шаблон страницы авторизации ещё не загружен');
    return '';
  }

  return templates['auth-layout']({ title, subtitle, topBar, children });
}
