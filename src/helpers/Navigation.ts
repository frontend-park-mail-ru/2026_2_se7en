import { ROUTES } from '@/constants/Routes';

export function isAuthPath(pathname: string): boolean {
  return pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER;
}
