export interface UserProfile {
  id: string;
  nickname: string;
}

export interface User {
  id: string;
  email: string;
  phoneNumber: string | null;
  profile: UserProfile;
}

export interface RegisterData {
  email: string;
  password: string;
  nickname: string;
  phoneNumber?: string | null;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface CurrentUser {
  name: string;
}

export interface LoginFieldConfig {
  id: string;
  name: string;
  type: 'email' | 'password';
  label: string;
  placeholder: string;
  value: string;
  error: string;
}

export type LoginFieldErrors = Partial<Record<keyof LoginData, string>>;

export interface RegisterFormData {
  first_name: string;
  nickname: string;
  email: string;
  password: string;
}

export type RegisterField = keyof RegisterFormData;

export type RegisterFieldErrors = Partial<Record<keyof RegisterFormData, string>>;
