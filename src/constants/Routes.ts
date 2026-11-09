type Route =
  | 'HOME'
  | 'LOGIN'
  | 'REGISTER'
  | 'CONTACTS'
  | 'PROFILE'
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
  LOGIN: '/login',
  REGISTER: '/register',
  USER_PROFILE_PATTERN: /^\/users\/[^/]+$/,
  PROFILE,
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
