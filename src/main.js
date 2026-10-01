import { PageIndex } from './pages/index.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    const page = new PageIndex();
    app.innerHTML = page.render();
    page.mount();
  } else {
    debugError('Элемент app не найден в index.html');
  }
});

function debugError(error) {
  if (error instanceof Error) {
    console.error(error.message);
  } else if (typeof error === 'string') {
    console.error(error);
  } else {
    console.error('Неизвестная ошибка:', error);
  }
}
