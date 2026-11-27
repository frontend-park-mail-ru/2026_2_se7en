type Route =
  | 'HOME'
  | 'LOGIN'
  | 'REGISTER'
  | 'CONTACTS'
  | 'USERS'
  | 'PROFILE'
  | 'PROFILE_MENU'
  | 'PROFILE_PUBLIC'
  | 'PROFILE_SECURITY'
  | 'PROFILE_EMAIL'
  | 'PROFILE_PHONE'
  | 'PROFILE_PASSWORD'
  | 'PROFILE_PATTERN'
  | 'USER_PROFILE_PATTERN';

const PROFILE = '/profile';

export const ROUTES = {
  HOME: '/chats',
  CONTACTS: '/contacts',
  USERS: '/users',
  LOGIN: '/login',
  REGISTER: '/register',
  USER_PROFILE_PATTERN: /^\/users\/[^/]+$/,
  PROFILE,
  PROFILE_MENU: `${PROFILE}/menu`,
  PROFILE_PUBLIC: `${PROFILE}/public`,
  PROFILE_SECURITY: `${PROFILE}/security`,
  PROFILE_EMAIL: `${PROFILE}/email`,
  PROFILE_PHONE: `${PROFILE}/phone`,
  PROFILE_PASSWORD: `${PROFILE}/password`,
  PROFILE_PATTERN: /^\/profile(\/[^/]+)?$/,
} as const satisfies Record<Route, string | RegExp>;

export function getUserProfileHref(id: string): string {
  return `/users/${encodeURIComponent(id)}`;
}
