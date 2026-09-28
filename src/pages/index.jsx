import { useState } from 'react';
import Header from '../components/Header';
import Button from '../components/Button';

export default function Index() {
  const [serverStatus, setServerStatus] = useState('Не проверено');

  const checkServer = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setServerStatus(data.message);
    } catch (error) {
      setServerStatus('Ошибка подключения к серверу');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="sVyaZь и тОчка" />

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Статус сервера:</h2>
          <p className="text-blue-600 font-mono mb-6 bg-blue-50 p-3 rounded">{serverStatus}</p>

          <div className="flex gap-4 justify-center">
            <Button text="Проверить API" onClick={checkServer} />
            <Button
              text="Очистить"
              variant="secondary"
              onClick={() => setServerStatus('Не проверено')}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
