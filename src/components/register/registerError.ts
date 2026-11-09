import './registerError.scss';
import { BannerErrorIcon } from '@/components/core/Icons.js';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';

/**
 * Компонент блока общей ошибки
 */
export function renderRegisterError(generalError: string | null): string {
  if (!generalError) return '';

  const safeMessage = escapeHtml(generalError);

  return `
        <div id="error-container" role="alert" aria-live="assertive" class="register-error">
            <div class="register-error__content">
                ${BannerErrorIcon}
                <div>
                    <p class="register-error__title">Не удалось отправить данные</p>
                    <p class="register-error__hint">${safeMessage}</p>
                </div>
            </div>
        </div>
    `;
}
