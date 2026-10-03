import { Button } from './Button.js';

/**
 * Компонент навигации
 * @param {number} currentStep - текущий шаг
 */
export function renderRegisterNavigation(currentStep) {
    const backIcon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
    </svg>`;

    return `
        <div class="flex items-center justify-between mb-8">
            ${Button({
                id: 'back-button',
                text: currentStep === 2 ? 'Вернуться к шагу 1' : 'Вернуться ко входу',
                mode: 'ghost',
                className: 'flex items-center gap-2 text-sm',
                iconBefore: backIcon
            })}
            <span class="text-sm font-bold text-gray-900">Шаг ${currentStep} из 2</span>
        </div>
    `;
}