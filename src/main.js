import './index.css';
import { Index, initIndex } from './pages/index.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = Index();
    initIndex();
  } else {
    console.error('Элемент #app не найден в index.html');
  }
});
