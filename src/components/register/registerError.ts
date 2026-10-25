import { BannerErrorIcon } from '@/components/core/Icons.js';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';

/**
 * Компонент блока общей ошибки
 */
export function renderRegisterError(generalError: string | null): string {
  if (!generalError) return '';

  const safeMessage = escapeHtml(generalError);

  return `
        <div id="error-container" role="alert" aria-live="assertive" class="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg">
            <div class="flex items-start gap-3">
                ${BannerErrorIcon}
                <div>
                    <p class="text-red-800 text-sm font-medium">Не удалось отправить данные</p>
                    <p class="text-red-600 text-xs mt-0.5">${safeMessage}</p>
                </div>
            </div>
        </div>
    `;
}
