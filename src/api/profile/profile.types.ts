export interface ProfileData {
  id: string;
  email: string;
  first_name: string;
  last_name: string | null;
  nickname: string;
  phone_number: string | null;
  icon_url: string | null;
}

export interface UpdateProfileData {
  email?: string;
  first_name?: string;
  last_name?: string;
  nickname?: string;
}
