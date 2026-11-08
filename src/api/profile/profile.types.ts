export interface ProfileData {
  id: string;
  email: string;
  first_name: string;
  last_name: string | null;
  nickname: string;
  bio?: string | null;
  phone_number?: string | null;
  icon_id?: string | null;
  icon_url?: string | null;
}

export interface UpdateProfileData {
  email?: string;
  first_name?: string;
  last_name?: string;
  nickname?: string;
  bio?: string;
  phone_number?: string;
}

export interface UpdatePasswordData {
  old_password: string;
  new_password: string;
}

export interface ProfileFormValues {
  first_name: string;
  last_name: string;
  nickname: string;
  phone: string;
  email: string;
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export type ProfileField = keyof ProfileFormValues;

export type ProfileFieldErrors = Partial<Record<ProfileField, string>>;
