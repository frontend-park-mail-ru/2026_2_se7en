import { AuthApi } from '@/api/auth/AuthApi.ts';
import { ChatsPage } from '@/pages/ChatsPage/ChatsPage.ts';
import { LoginPage } from '@/pages/LoginPage/LoginPage.ts';
import { RegisterPage } from '@/pages/RegisterPage/RegisterPage.ts';
import { router } from '@/helpers/Router.ts';
import { ROUTES } from '@/constants/Routes.ts';
import { eventBus } from '@/helpers/EventBus.ts';

router
  .use(ROUTES.HOME, ChatsPage, { requiresAuth: true })
  .use(ROUTES.LOGIN, LoginPage, { guestOnly: true })
  .use(ROUTES.REGISTER, RegisterPage, { guestOnly: true });

eventBus.on('auth:unauthorized', () => {
  const currentPath = window.location.pathname;
  if (currentPath === ROUTES.LOGIN || currentPath === ROUTES.REGISTER) return;

  router.setAuthState(false);
  void router.go(ROUTES.LOGIN, { replace: true });
});

async function initApp() {
  const response = await AuthApi.getCurrentUser();
  router.setAuthState(response.success);
  router.start();
}

void initApp();
