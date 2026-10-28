import './styles/base.scss';
import { ChatsPage } from '@/pages/ChatsPage/ChatsPage.ts';
import { LoginPage } from '@/pages/LoginPage/LoginPage.ts';
import { ROUTES } from '@/constants/Routes.ts';
import { RegisterPage } from '@/pages/RegisterPage/RegisterPage.ts';
import { router } from '@/helpers/Router.ts';
import { user } from '@/store/User';

router.setAuthCheck(() => user.getIsAuth());

router
  .use(ROUTES.HOME, ChatsPage, { requiresAuth: true })
  .use(ROUTES.LOGIN, LoginPage, { guestOnly: true })
  .use(ROUTES.REGISTER, RegisterPage, { guestOnly: true });

async function initApp() {
  await user.updateCurrentUser();
  router.start();
}

void initApp();
