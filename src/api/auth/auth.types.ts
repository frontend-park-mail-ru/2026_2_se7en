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
