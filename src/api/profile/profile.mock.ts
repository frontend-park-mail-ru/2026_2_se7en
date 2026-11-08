import { MOCK_CREDENTIALS } from '@/api/auth/auth.mock.ts';
import { STATUSES } from '@/constants/Statuses.ts';
import { ApiError, type ApiResult, ApiSuccess } from '@/api/ApiResponse.ts';
import { debugError } from '@/helpers/DebugError.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@/api/error.constants.ts';
import type { ProfileData, UpdatePasswordData, UpdateProfileData } from './Profile.types.ts';

const STORAGE_PROFILE_KEY = 'mock_profile_state';
const STORAGE_PASSWORD_KEY = 'mock_profile_password';

/** Дефолтное состояние профиля до любых изменений. */
const DEFAULT_MOCK_PROFILE: ProfileData = {
  id: '1',
  email: 'user@example.com',
  first_name: 'Влад',
  last_name: 'Мазанов',
  nickname: 'xah7p',
  bio: null,
  phone_number: '+79991234567',
  icon_id: null,
  icon_url: null,
};

/** Читает сохранённое состояние профиля из localStorage или возвращает дефолт. */
function loadMockProfile(): ProfileData {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
    if (raw) {
      return { ...DEFAULT_MOCK_PROFILE, ...(JSON.parse(raw) as Partial<ProfileData>) };
    }
  } catch (error) {
    debugError(error);
  }

  return { ...DEFAULT_MOCK_PROFILE };
}

/** Сохраняет состояние профиля в localStorage. */
function saveMockProfile(profile: ProfileData): void {
  try {
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    debugError(error);
  }
}

/** Возвращает сохранённый пароль мока или дефолтный. */
function getMockPassword(): string {
  try {
    return localStorage.getItem(STORAGE_PASSWORD_KEY) || MOCK_CREDENTIALS.password;
  } catch (error) {
    debugError(error);
    return MOCK_CREDENTIALS.password;
  }
}

/** Сохраняет пароль мока в localStorage. */
function saveMockPassword(password: string): void {
  try {
    localStorage.setItem(STORAGE_PASSWORD_KEY, password);
  } catch (error) {
    debugError(error);
  }
}

/**
 * Мок-ответ на запрос получения профиля.
 */
export async function mockGetProfile(): Promise<ApiResult<ProfileData>> {
  await new Promise<void>((r) => setTimeout(r, 300));
  return new ApiSuccess<ProfileData>(loadMockProfile(), STATUSES.OK);
}

/**
 * Мок-ответ на запрос обновления профиля.
 */
export async function mockUpdateProfile(data: UpdateProfileData): Promise<ApiResult<ProfileData>> {
  await new Promise<void>((r) => setTimeout(r, 500));

  const current = loadMockProfile();
  const next: ProfileData = {
    ...current,
    ...data,
    last_name: data.last_name === '' ? null : (data.last_name ?? current.last_name),
  };

  saveMockProfile(next);
  return new ApiSuccess<ProfileData>(next, STATUSES.OK);
}

/**
 * Мок-ответ на запрос смены пароля (проверяет старый пароль).
 */
export async function mockUpdatePassword(data: UpdatePasswordData): Promise<ApiResult<null>> {
  await new Promise<void>((r) => setTimeout(r, 500));

  const currentPassword = getMockPassword();
  if (data.old_password !== currentPassword) {
    return new ApiError(
      ERROR_CODES.INVALID_CREDENTIALS,
      ERROR_MESSAGES[ERROR_CODES.INVALID_CREDENTIALS],
      STATUSES.BAD_REQUEST,
      [{ field: 'old_password', reason: 'invalid_old_password' }],
    );
  }

  saveMockPassword(data.new_password);
  return new ApiSuccess<null>(null, STATUSES.NO_CONTENT);
}
