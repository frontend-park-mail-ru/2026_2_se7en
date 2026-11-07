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

export const ROUTES = {
  HOME: '/chats',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  PROFILE_PUBLIC: '/profile/public',
  PROFILE_SECURITY: '/profile/security',
  PROFILE_EMAIL: '/profile/email',
  PROFILE_PHONE: '/profile/phone',
  PROFILE_PASSWORD: '/profile/password',
  PROFILE_PATTERN: /^\/profile(\/(public|security|email|phone|password))?$/,
} as const satisfies Record<Route, string | RegExp>;
