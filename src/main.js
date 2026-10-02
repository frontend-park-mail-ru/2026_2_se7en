import { PageIndex } from './pages/index/index.js';
import { PageChats } from './pages/chat/Chats.js';

const app = document.getElementById('app');

function showPage(PageClass) {
  const page = new PageClass();
  app.innerHTML = page.render();
  page.mount();
}

document.addEventListener('DOMContentLoaded', () => {
  showPage(PageIndex);
});
