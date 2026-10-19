import { ROUTES } from '@/constants/Routes.ts';

/**
 * Проверяет, относится ли указанный путь к страницам авторизации
 * (вход или регистрация).
 *
 * @param pathname - URL-путь для проверки (например, `/login`).
 * @returns `true`, если путь относится к авторизации, иначе `false`.
 *
 * @example
 *   isAuthPath('/login');    // true
 *   isAuthPath('/register'); // true
 *   isAuthPath('/chats');    // false
 */
export function isAuthPath(pathname: string): boolean {
  return pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER;
}
