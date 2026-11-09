import type {
  ProfileData,
  ProfileFieldErrors,
  ProfileFormValues,
} from '@/api/profile/profile.types';

export type ProfileTab = 'public' | 'security' | 'email' | 'phone' | 'password';

export interface ProfileCardParams {
  name: string;
  subtitle: string;
  avatarUrl?: string | null;
  initials?: string;
  canChangeAvatar?: boolean;
  isAvatarUploading?: boolean;
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

export interface FormRenderOptions {
  values: ProfileFormValues;
  errors: ProfileFieldErrors;
  isSubmitting: boolean;
  formError?: string | null;
}

export interface ProfileFormParams {
  fields: FormFieldParams[];
  cancelHref?: string;
  isSubmitting?: boolean;
  formError?: string | null;
}

export interface ProfileContentParams {
  profile: ProfileData | null;
  activeTab: ProfileTab;
  formValues: ProfileFormValues;
  fieldErrors: ProfileFieldErrors;
  isSubmitting: boolean;
  formError?: string | null;
  errorMessage?: string | null;
  isAvatarUploading?: boolean;
}
