import { AuthApi } from '@/api/auth/AuthApi.ts';
import { eventBus } from '@/helpers/EventBus.ts';
import { router } from '@/helpers/Router.ts';
import { ROUTES } from '@/constants/Routes.ts';
import { STATUSES } from '@/constants/Statuses.ts';
import type { CurrentUser, LoginData } from '@/api/auth/auth.types.ts';
import { isAuthPath } from '@/constants/Routes.ts';

/**
 * Сервис управления состоянием текущего пользователя и авторизации.
 */
class User {
  /** Флаг статуса авторизации пользователя. */
  private _isAuth = false;

  /** Данные текущего пользователя. */
  data: CurrentUser = { name: '' };

  constructor() {
    eventBus.on('auth:unauthorized', () => {
      this._isAuth = false;
      this.data.name = '';

      const currentPath = window.location.pathname;

      if (!isAuthPath(window.location.pathname)) {
        void router.goTo(ROUTES.LOGIN, { replace: true });
      }
    });
  }

  getIsAuth(): boolean {
    return this._isAuth;
  }

  /**
   * Выполняет вход пользователя через API и обновляет статус.
   *
   * @param loginData Данные формы входа.
   */
  async login(loginData: LoginData) {
    const result = await AuthApi.login(loginData);

    if (result.success) {
      this._isAuth = true;
      this.data.name = result.data.profile?.nickname || '';
    }

    return result;
  }

  /**
   * Завершает сессию пользователя на сервере и сбрасывает данные.
   */
  async logout() {
    const result = await AuthApi.logout();

    if (result.success || result.status === STATUSES.UNAUTHORIZED) {
      this._isAuth = false;
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
      this._isAuth = true;
      this.data.name = response.data?.profile?.nickname || '';
    } else {
      this._isAuth = false;
      this.data.name = '';
    }

    return response;
  }
}

/**
 * Единственный экземпляр сервиса пользователя на всё приложение.
 */
export const user = new User();
