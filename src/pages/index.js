import { Header } from '../components/Header.js';
import { Button } from '../components/Button.js';

const SERVER_STATUS = {
  NOT_CHECKED: 'Не проверено',
  ERROR: 'Ошибка подключения к серверу',
};

const ELEMENT_IDS = {
  SERVER_STATUS: 'server-status',
  CHECK_BUTTON: 'check-btn',
  CLEAR_BUTTON: 'clear-btn',
};

export class PageIndex {
  constructor() {
    this.serverStatus = SERVER_STATUS.NOT_CHECKED;
  }

  render() {
    return `
      <div class="min-h-screen bg-gray-50 flex flex-col">
        ${Header({ title: 'sVyaZь и тОчка' })}
        
        <main class="flex-1 flex flex-col items-center justify-center p-6">
          <div class="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">
              Статус сервера:
            </h2>
            <p id="server-status" class="text-blue-600 font-mono mb-6 bg-blue-50 p-3 rounded">
              ${this.serverStatus}
            </p>
            
            <div class="flex gap-4 justify-center">
              ${Button({ id: ELEMENT_IDS.CHECK_BUTTON, text: 'Проверить API', mode: 'primary' })}
              ${Button({ id: ELEMENT_IDS.CLEAR_BUTTON, text: 'Очистить', mode: 'secondary' })}
            </div>
          </div>
        </main>
      </div>
    `;
  }

  mount() {
    this.bindEvents();
  }

  bindEvents() {
    document.getElementById(ELEMENT_IDS.CHECK_BUTTON)?.addEventListener('click', () => {
      this.checkServer();
    });

    document.getElementById(ELEMENT_IDS.CLEAR_BUTTON)?.addEventListener('click', () => {
      this.clearStatus();
    });
  }

  async checkServer() {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      const data = await response.json();
      this.serverStatus = data.message;
      this.updateStatus();
    } catch (error) {
      this.serverStatus = SERVER_STATUS.ERROR;
      this.updateStatus();
    }
  }

  clearStatus() {
    this.serverStatus = SERVER_STATUS.NOT_CHECKED;
    this.updateStatus();
  }

  updateStatus() {
    const statusElement = document.getElementById(ELEMENT_IDS.SERVER_STATUS);
    if (statusElement) {
      statusElement.textContent = this.serverStatus;
    }
  }
}
