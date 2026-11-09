import './registerHeader.scss';
import { Image } from '@/components/core/Image.js';

/**
 * Компонент хедера
 */
export function renderRegisterHeader(): string {
  return `
        <div class="register-header">
            <div class="register-header__brand">
                ${Image({
                  src: '/pictures/icon.png',
                  alt: 'Логотип',
                  className: 'register-header__logo',
                })}
                <span class="register-header__brand-name">Связь</span>
            </div>

            <div class="register-header__pitch">
                <div class="register-header__pitch-inner">
                    <h1 class="register-header__title">
                        Соберите свой круг общения
                    </h1>
                    <p class="register-header__subtitle">
                        Личный профиль помогает друзьям быстро узнать вас и начать разговор.
                    </p>
                </div>
            </div>
        </div>
    `;
}
