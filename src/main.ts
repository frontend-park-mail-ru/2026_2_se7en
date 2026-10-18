import { AuthApi } from '@/api/auth/AuthApi.ts';
import { ChatsPage } from '@/pages/ChatsPage/ChatsPage.ts';
import { LoginPage } from '@/pages/LoginPage/LoginPage.ts';
import { RegisterPage } from '@/pages/RegisterPage/RegisterPage.ts';
import { router } from '@/helpers/Router.ts';
import { ROUTES } from '@/constants/Routes.ts';
import { eventBus } from '@/helpers/EventBus.ts';

router.setAuthCheck(async () => {
  const response = await AuthApi.getCurrentUser();
  return response.success;
});

router
  .use(ROUTES.HOME, ChatsPage, { requiresAuth: true })
  .use(ROUTES.LOGIN, LoginPage, { guestOnly: true })
  .use(ROUTES.REGISTER, RegisterPage, { guestOnly: true });

eventBus.on('auth:unauthorized', () => {
  if (window.location.pathname === ROUTES.LOGIN || window.location.pathname === ROUTES.REGISTER)
    return;
  void router.go(ROUTES.LOGIN, { replace: true });
});

router.start();
