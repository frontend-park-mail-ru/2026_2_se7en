import './registerHeader.scss';
import { Image } from '@/components/core/Image.js';

/**
 * Компонент хедера
 */
export function renderRegisterHeader(): string {
  return `
        <div class="register-aside">
            <div class="register-aside__brand">
                ${Image({
                  src: '/pictures/icon.png',
                  alt: 'Логотип',
                  className: 'register-aside__logo',
                })}
                <span class="register-aside__brand-name">Связь</span>
            </div>

            <div class="register-aside__pitch">
                <div class="register-aside__pitch-inner">
                    <h1 class="register-aside__title">
                        Соберите свой круг общения
                    </h1>
                    <p class="register-aside__subtitle">
                        Личный профиль помогает друзьям быстро узнать вас и начать разговор.
                    </p>
                </div>
            </div>
        </div>
    `;
}
