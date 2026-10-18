import { ChatsPage } from '@/pages/ChatsPage/ChatsPage.ts';
import { LoginPage } from '@/pages/LoginPage/LoginPage.ts';
import { RegisterPage } from '@/pages/RegisterPage/RegisterPage.ts';
import { router } from '@/helpers/Router.ts';
import { ROUTES } from '@/constants/Routes.ts';
import { user } from '@/helpers/User.ts';

router.setAuthCheck(() => user.isAuth);

router
  .use(ROUTES.HOME, ChatsPage, { requiresAuth: true })
  .use(ROUTES.LOGIN, LoginPage, { guestOnly: true })
  .use(ROUTES.REGISTER, RegisterPage, { guestOnly: true });

async function initApp() {
  await user.updateCurrentUser();
  router.start();
}

void initApp();
