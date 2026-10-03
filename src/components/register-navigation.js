/**
 * Компонент навигации
 * @param {number} currentStep - текущий шаг
 */
export function renderRegisterNavigation(currentStep) {
    return `
        <div class="flex items-center justify-between mb-8">
            <button id="back-button" class="flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors text-sm font-medium cursor-pointer bg-transparent border-none">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                ${currentStep === 2 ? 'Вернуться к шагу 1' : 'Вернуться ко входу'}
            </button>
            <span class="text-sm font-bold text-gray-900">Шаг ${currentStep} из 2</span>
        </div>
    `;
}
