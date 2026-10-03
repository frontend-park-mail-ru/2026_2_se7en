/**
 * Компонент хедера
 */
export function renderRegisterHeader() {
    return `
        <div class="hidden lg:flex lg:w-1/2 bg-[#f5f9ff] p-12 flex-col">
            <div class="flex items-center gap-3">
                <img src="../../public/pictures/icon.png" alt="Логотип" class="w-12 h-12 rounded-xl object-cover" />
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
