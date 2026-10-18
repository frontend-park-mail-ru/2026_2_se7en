import { AuthApi } from '@/api/auth/AuthApi.ts';
import { eventBus } from '@/helpers/EventBus.ts';
import { router } from '@/helpers/Router.ts';
import { ROUTES } from '@/constants/Routes.ts';
import { STATUSES } from '@/constants/Statuses.ts';
import type { CurrentUser, LoginData } from '@/api/auth/auth.types.ts';

/**
 * Сервис управления состоянием текущего пользователя и авторизации.
 */
class User {
  /** Флаг статуса авторизации пользователя. */
  isAuth = false;

  /** Данные текущего пользователя. */
  data: CurrentUser = { name: '' };

  constructor() {
    eventBus.on('auth:unauthorized', () => {
      this.isAuth = false;
      this.data.name = '';

      const currentPath = window.location.pathname;
      if (currentPath !== ROUTES.LOGIN && currentPath !== ROUTES.REGISTER) {
        void router.goTo(ROUTES.LOGIN, { replace: true });
      }
    });
  }

  /**
   * Выполняет вход пользователя через API и обновляет статус.
   *
   * @param loginData Данные формы входа.
   */
  async login(loginData: LoginData) {
    const result = await AuthApi.login(loginData);
    if (result.success) {
      this.isAuth = true;
      this.data.name = result.data.profile?.nickname || '';
    }
    return result;
  }

  /**
   * Завершает сессию пользователя на сервере и сбрасывает данные.
   */
  async logout() {
    const result = await AuthApi.logout();
    if (result.success || ('status' in result && result.status === STATUSES.UNAUTHORIZED)) {
      this.isAuth = false;
      this.data.name = '';
    }
    return result;
  }

  /**
   * Запрашивает профиль текущего пользователя и обновляет внутреннее состояние.
   */
  async updateCurrentUser() {
    const response = await AuthApi.getCurrentUser();
    if (response.success) {
      this.isAuth = true;
      this.data.name = response.data?.profile?.nickname || '';
    } else {
      this.isAuth = false;
      this.data.name = '';
    }
    return response;
  }
}

/**
 * Единственный экземпляр сервиса пользователя на всё приложение.
 */
export const user = new User();
