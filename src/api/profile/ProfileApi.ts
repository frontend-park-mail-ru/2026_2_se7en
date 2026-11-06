import { ApiSuccess, type ApiResult } from '@/api/ApiResponse';
import { STATUSES } from '@/constants/Statuses';
import type { ProfileData, UpdateProfileData } from './profile.types';

const MOCK_PROFILE: ProfileData = {
  id: '1',
  email: 'xah7p@yandex.ru',
  first_name: 'Влад',
  last_name: 'Мазанов',
  nickname: 'xah7p',
  phone_number: '+7 (999) 123-45-67',
  icon_url: null,
};

export class ProfileApi {
  static async getProfile(): Promise<ApiResult<ProfileData>> {
    await new Promise((r) => setTimeout(r, 300));
    return new ApiSuccess<ProfileData>({ ...MOCK_PROFILE }, STATUSES.OK);
  }

  static async updateProfile(data: UpdateProfileData): Promise<ApiResult<ProfileData>> {
    await new Promise((r) => setTimeout(r, 500));
    return new ApiSuccess<ProfileData>({ ...MOCK_PROFILE, ...data }, STATUSES.OK);
  }
}
