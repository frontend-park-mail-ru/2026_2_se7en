import { ChatsPage } from './pages/ChatsPage/ChatsPage.js';
import { LoginPage } from './pages/LoginPage/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage/RegisterPage.js';
import { SwaggerPage } from './pages/SwaggerPage/SwaggerPage.js';
import { ROUTES } from './constants/Routes.js';
import { showPage } from './helpers/showPage.js';

const pages = {
  [ROUTES.HOME]: ChatsPage,
  [ROUTES.LOGIN]: LoginPage,
  [ROUTES.REGISTER]: RegisterPage,
  [ROUTES.SWAGGER]: SwaggerPage,
};

function pageForPath(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  return pages[normalizedPath] || ChatsPage;
}

function mountPageForCurrentPath() {
  const PageClass = pageForPath(window.location.pathname);
  const page = new PageClass();
  return page.mount();
}

window.addEventListener('popstate', () => void mountPageForCurrentPath());

if (window.location.pathname === '/') {
  void showPage(ChatsPage);
} else {
  void mountPageForCurrentPath();
}
