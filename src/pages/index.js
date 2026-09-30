import { Header } from '../components/Header.js';
import { Button } from '../components/Button.js';

export function Index() {
  let serverStatus = 'Не проверено';

  const checkServer = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      serverStatus = data.message;
      updateStatus();
    } catch (error) {
      serverStatus = 'Ошибка подключения к серверу';
      updateStatus();
    }
  };

  const clearStatus = () => {
    serverStatus = 'Не проверено';
    updateStatus();
  };

  const updateStatus = () => {
    const statusElement = document.getElementById('server-status');
    if (statusElement) {
      statusElement.textContent = serverStatus;
    }
  };

  return `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      ${Header({ title: 'sVyaZь и тОчка' })}
      
      <main class="flex-1 flex flex-col items-center justify-center p-6">
        <div class="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            Статус сервера:
          </h2>
          <p id="server-status" class="text-blue-600 font-mono mb-6 bg-blue-50 p-3 rounded">
            ${serverStatus}
          </p>
          
          <div class="flex gap-4 justify-center">
            <button id="check-btn" class="px-6 py-2 rounded-lg font-medium transition-all duration-200 bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg">
              Проверить API
            </button>
            <button id="clear-btn" class="px-6 py-2 rounded-lg font-medium transition-all duration-200 bg-gray-200 text-gray-800 hover:bg-gray-300">
              Очистить
            </button>
          </div>
        </div>
      </main>
    </div>
  `;
}

export function initIndex() {
  document.getElementById('check-btn')?.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      document.getElementById('server-status').textContent = data.message;
    } catch (error) {
      document.getElementById('server-status').textContent = 'Ошибка подключения к серверу';
    }
  });

  document.getElementById('clear-btn')?.addEventListener('click', () => {
    document.getElementById('server-status').textContent = 'Не проверено';
  });
}
