import { ChatsPage } from '@/pages/ChatsPage/ChatsPage.js';
import { LoginPage } from '@/pages/LoginPage/LoginPage.js';
import { RegisterPage } from '@/pages/RegisterPage/RegisterPage.js';
import { ROUTES } from '@/constants/Routes.js';
import { showPage } from '@/helpers/ShowPage.js';
import { Page } from '@/pages/Page.js';

type PageConstructor = typeof Page;

const pages: Record<string, PageConstructor> = {
  [ROUTES.HOME]: ChatsPage,
  [ROUTES.LOGIN]: LoginPage,
  [ROUTES.REGISTER]: RegisterPage,
};

function pageForPath(pathname: string): PageConstructor {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  return pages[normalizedPath] ?? ChatsPage;
}

async function mountPageForCurrentPath(): Promise<boolean> {
  const PageClass = pageForPath(window.location.pathname);
  const page = new PageClass();

  return await page.mount();
}

window.addEventListener('popstate', () => {
  void mountPageForCurrentPath();
});

if (window.location.pathname === '/') {
  void showPage(ChatsPage);
} else {
  void mountPageForCurrentPath();
}
