import { STATUSES } from '@/constants/Statuses.ts';
import { type ApiResult, ApiSuccess } from '@/api/ApiResponse.ts';
import type { ProfileData, UpdateProfileData } from './profile.types.ts';

const MOCK_PROFILE: ProfileData = {
  id: '1',
  email: 'user@example.com',
  first_name: 'Влад',
  last_name: 'Мазанов',
  nickname: 'xah7p',
  phone_number: '+7 (999) 123-45-67',
  icon_url: null,
};

/**
 * Мок-ответ на запрос получения профиля.
 */
export async function mockGetProfile(): Promise<ApiResult<ProfileData>> {
  await new Promise<void>((r) => setTimeout(r, 300));
  return new ApiSuccess<ProfileData>({ ...MOCK_PROFILE }, STATUSES.OK);
}

/**
 * Мок-ответ на запрос обновления профиля.
 */
export async function mockUpdateProfile(data: UpdateProfileData): Promise<ApiResult<ProfileData>> {
  await new Promise<void>((r) => setTimeout(r, 500));
  return new ApiSuccess<ProfileData>({ ...MOCK_PROFILE, ...data }, STATUSES.OK);
}
