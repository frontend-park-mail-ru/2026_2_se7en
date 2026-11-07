type Route =
  | 'HOME'
  | 'LOGIN'
  | 'REGISTER'
  | 'PROFILE'
  | 'PROFILE_PUBLIC'
  | 'PROFILE_SECURITY'
  | 'PROFILE_EMAIL'
  | 'PROFILE_PHONE'
  | 'PROFILE_PASSWORD'
  | 'PROFILE_PATTERN';

const PROFILE = '/profile';

export const ROUTES = {
  HOME: '/chats',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE,
  PROFILE_PUBLIC: `${PROFILE}/public`,
  PROFILE_SECURITY: `${PROFILE}/security`,
  PROFILE_EMAIL: `${PROFILE}/email`,
  PROFILE_PHONE: `${PROFILE}/phone`,
  PROFILE_PASSWORD: `${PROFILE}/password`,
  PROFILE_PATTERN: /^\/profile(\/[^/]+)?$/,
} as const satisfies Record<Route, string | RegExp>;
