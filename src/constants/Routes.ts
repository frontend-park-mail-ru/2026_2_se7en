type Route = 'HOME' | 'LOGIN' | 'REGISTER';

export const ROUTES: Record<Route, string> = {
  HOME: '/chats',
  LOGIN: '/login',
  REGISTER: '/register',
};

export function isAuthPath(pathname: string): boolean {
  return pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER;
}
