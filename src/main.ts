import './styles/base.scss';
import { ChatsPage } from '@/pages/ChatsPage/ChatsPage.ts';
import { ContactsPage } from '@/pages/ContactsPage/ContactsPage.ts';
import { LoginPage } from '@/pages/LoginPage/LoginPage.ts';
import { ProfilePage } from '@/pages/ProfilePage/ProfilePage.ts';
import { ROUTES } from '@/constants/Routes.ts';
import { RegisterPage } from '@/pages/RegisterPage/RegisterPage.ts';
import { UserProfilePage } from '@/pages/UserProfilePage/UserProfilePage';
import { router } from '@/helpers/Router.ts';
import { user } from '@/store/User';

router.setAuthCheck(() => user.getIsAuth());

router
  .use(ROUTES.HOME, ChatsPage, { requiresAuth: true })
  .use(ROUTES.CONTACTS, ContactsPage, { requiresAuth: true })
  .use(ROUTES.LOGIN, LoginPage, { guestOnly: true })
  .use(ROUTES.REGISTER, RegisterPage, { guestOnly: true })
  .use(ROUTES.USER_PROFILE_PATTERN, UserProfilePage, { requiresAuth: true })
  .use(ROUTES.PROFILE_PATTERN, ProfilePage, { requiresAuth: true });

async function initApp() {
  await user.updateCurrentUser();
  router.start();

  // Service Worker в продакшене
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    navigator.serviceWorker.register('/sw.js');
  }
}

void initApp();
