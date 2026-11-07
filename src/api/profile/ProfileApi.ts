import type { ApiResult } from '@/api/ApiResponse.ts';
import { PROFILE_URL } from '@/api/profile/profile.constants.ts';
import { ServerApi } from '@/api/ServerApi.ts';
import { USING_MOCK } from '@/api/api.constants.ts';
import type { ProfileData, UpdateProfileData } from '@/api/profile/profile.types.ts';
import { mockGetProfile, mockUpdateProfile } from '@/api/profile/profile.mock.ts';

/**
 * API для работы с профилем пользователя.
 */
export class ProfileApi extends ServerApi {
  /**
   * Получение данных профиля пользователя.
   */
  static async getProfile(): Promise<ApiResult<ProfileData>> {
    if (USING_MOCK.PROFILE) {
      return mockGetProfile();
    }

    return this._request<ProfileData>(PROFILE_URL);
  }

  /**
   * Обновление данных профиля пользователя.
   */
  static async updateProfile(data: UpdateProfileData): Promise<ApiResult<ProfileData>> {
    if (USING_MOCK.PROFILE) {
      return mockUpdateProfile(data);
    }

    return this._request<ProfileData>(PROFILE_URL, {
      method: 'PATCH',
      body: data,
    });
  }
}
