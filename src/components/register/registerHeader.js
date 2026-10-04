import { Image } from '../Image.js';

/**
 * Компонент хедера
 */
export function renderRegisterHeader() {
  return `
        <div class="hidden lg:flex lg:w-1/2 bg-[#f5f9ff] p-12 flex-col">
            <div class="flex items-center gap-3">
                ${Image({
                  src: '../../public/pictures/icon.png',
                  alt: 'Логотип',
                  width: 'w-12',
                  height: 'h-12',
                  className: 'rounded-xl object-cover',
                })}
                <span class="text-2xl font-semibold text-gray-900">Связь</span>
            </div>

            <div class="flex-1 flex items-center">
                <div class="max-w-md">
                    <h1 class="text-gray-900 mb-4 font-bold text-[44px] leading-[108%] tracking-[-1.5px]">
                        Соберите свой круг общения
                    </h1>
                    <p class="text-gray-500 text-lg leading-relaxed">
                        Личный профиль помогает друзьям быстро узнать вас и начать разговор.
                    </p>
                </div>
            </div>
        </div>
    `;
}
