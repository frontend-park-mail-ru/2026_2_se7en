export interface PublicProfileData {
  id: string;
  first_name: string;
  last_name?: string | null;
  nickname: string;
  bio?: string | null;
  icon_id?: string | null;
  icon_url?: string | null;
}

export interface ProfileData extends PublicProfileData {
  email: string;
  phone_number?: string | null;
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

export interface ProfileFormValues extends UpdatePasswordData {
  bio: string;
  first_name: string;
  last_name: string;
  nickname: string;
  phone: string;
  email: string;
  confirm_password: string;
}

export type ProfileField = keyof ProfileFormValues;

export type ProfileFieldErrors = Partial<Record<ProfileField, string>>;
