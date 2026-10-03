import { PageIndex } from './pages/index/index.js';
import { ChatsPage } from './pages/chat/ChatsPage.js';

const app = document.getElementById('app');

async function showPage(PageClass) {
  const page = new PageClass();
  app.innerHTML = page.render();
  await page.mount();
  app.innerHTML = page.render();
}

document.addEventListener('DOMContentLoaded', () => {
  showPage(ChatsPage);
});
