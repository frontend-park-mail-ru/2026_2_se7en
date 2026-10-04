import { ChatsPage } from './pages/ChatsPage/ChatsPage.js';
import { LoginPage } from './pages/LoginPage/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage/RegisterPage.js';
import { ROUTES } from './constants/Routes.js';
import { showPage } from './router.js';

const pages = {
  [ROUTES.HOME]: ChatsPage,
  [ROUTES.LOGIN]: LoginPage,
  [ROUTES.REGISTER]: RegisterPage,
};

function pageForPath(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  return pages[normalizedPath] || ChatsPage;
}

function mountPageForCurrentPath() {
  const PageClass = pageForPath(window.location.pathname);
  if (window.location.pathname !== PageClass.route) {
    window.history.replaceState({}, '', PageClass.route);
  }

  const page = new PageClass();
  return page.mount();
}

window.addEventListener('popstate', () => {
  void mountPageForCurrentPath();
});

document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
  if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;

  const url = new URL(link.href);
  const PageClass = pages[url.pathname.replace(/\/+$/, '') || '/'];
  if (url.origin !== window.location.origin || url.search || url.hash || !PageClass) return;

  event.preventDefault();
  void showPage(PageClass);
});

const PageClass = pageForPath(window.location.pathname);
if (window.location.pathname !== PageClass.route) {
  window.history.replaceState({}, '', PageClass.route);
}
const page = new PageClass();
page.mount();
