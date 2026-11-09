import type { ApiResult } from '@/api/ApiResponse.ts';
import { ServerApi } from '@/api/ServerApi.ts';
import { USING_MOCK } from '@/api/api.constants.ts';
import {
  PROFILE_AVATAR_URL,
  PROFILE_PASSWORD_URL,
  PROFILE_URL,
} from '@/api/profile/profile.constants.ts';
import type {
  ProfileData,
  UpdatePasswordData,
  UpdateProfileData,
} from '@/api/profile/profile.types';
import {
  mockGetProfile,
  mockUpdatePassword,
  mockUpdateProfile,
} from '@/api/profile/profile.mock.ts';

/**
 * API для работы с профилем пользователя.
 */
export class ProfileApi extends ServerApi {
  /**
   * Получение данных профиля пользователя (GET /api/v1/profile).
   */
  static async getProfile(): Promise<ApiResult<ProfileData>> {
    if (USING_MOCK.PROFILE) {
      return mockGetProfile();
    }

    return this._request<ProfileData>(PROFILE_URL);
  }

  /**
   * Обновление данных профиля пользователя (PATCH /api/v1/profile).
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

  /**
   * Загрузка файла аватара пользователя (PUT /api/v1/profile/avatar).
   */
  static async uploadAvatar(file: File): Promise<ApiResult<{ icon_url: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    return this._request<{ icon_url: string }>(PROFILE_AVATAR_URL, {
      method: 'PUT',
      body: formData,
    });
  }

  /**
   * Изменение пароля пользователя (PATCH /api/v1/profile/password).
   */
  static async updatePassword(data: UpdatePasswordData): Promise<ApiResult<null>> {
    if (USING_MOCK.PROFILE) {
      return mockUpdatePassword(data);
    }

    return this._request<null>(PROFILE_PASSWORD_URL, {
      method: 'PATCH',
      body: data,
    });
  }
}
