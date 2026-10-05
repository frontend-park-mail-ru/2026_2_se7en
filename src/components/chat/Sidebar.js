import { Button } from '../core/Button.js';
import { escapeHTML } from '../../helpers/escapeHTML.js';

/** Компонент боковой панели навигации. */
export class Sidebar {
  constructor(currentUser) {
    this.currentUser = currentUser;
  }

  render() {
    const firstLetter = Array.from(String(this.currentUser.name || '').trim())[0]
      ?.toLocaleUpperCase('ru-RU') || '?';
    const safeFirstLetter = escapeHTML(firstLetter);
    const logoutIcon = `
      <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4m4-4 4-4-4-4m4 4H9" />
      </svg>
    `;

    return `
      <aside class="w-20 bg-white border-r border-gray-200 flex flex-col">
        <div class="p-3 flex justify-center">
          <div class="w-12 h-12 bg-black rounded-xl flex items-center justify-center overflow-hidden">
            <img src="/pictures/icon.png" alt="Логотип" class="w-full h-full object-cover rounded-xl">
          </div>
        </div>

        <nav class="flex-1 flex flex-col gap-2 px-2">
          <button class="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 text-blue-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span class="text-xs mt-1">Чаты</span>
          </button>
          
          <button class="flex flex-col items-center justify-center p-3 rounded-xl text-gray-400 hover:bg-gray-50">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span class="text-xs mt-1">Контакты</span>
          </button>
        </nav>

        <div class="p-3 flex flex-col items-center gap-3">
          ${Button({
            id: 'logout-button',
            text: '',
            type: 'button',
            mode: 'ghost',
            ariaLabel: 'Выйти из аккаунта',
            title: 'Выйти',
            iconBefore: logoutIcon,
            className: 'w-9 h-9 p-0 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500 disabled:opacity-50',
          })}
          <div class="relative mx-auto w-10 h-10">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-600 font-semibold text-sm">${safeFirstLetter}</span>
            </div>
            <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>
      </aside>
    `;
  }
}
