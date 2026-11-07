import type { ProfileData } from '@/api/profile/profile.types';

export type ProfileTab = 'public' | 'security' | 'phone' | 'password';

export interface ProfileCardParams {
  name: string;
  subtitle: string;
}

export interface SecurityRow {
  label: string;
  value: string;
  target: ProfileTab;
}

export interface ProfileSecurityParams {
  email: string;
  phone: string;
  passwordMask: string;
}

export interface FormFieldParams {
  id: string;
  name: string;
  label: string;
  type?: string;
  value?: string;
  hint?: string;
  error?: string;
  isPassword?: boolean;
}

export interface ProfileFormParams {
  fields: FormFieldParams[];
}

export interface ProfileContentParams {
  profile: ProfileData | null;
  activeTab: ProfileTab;
}
