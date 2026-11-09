import type { PublicProfileData } from '@/api/profile/profile.types';
import { ApiError, type ApiResult, ApiSuccess } from '@/api/ApiResponse';
import type { Contact, ContactsResponse } from './contacts.types';

export const DEMO_PROFILES: PublicProfileData[] = [
  {
    id: 'demo-anna',
    first_name: 'Анна',
    last_name: 'Смирнова',
    nickname: 'anna_s',
    bio: 'Люблю путешествия, фотографию и хорошие истории.',
  },
  {
    id: 'demo-mikhail',
    first_name: 'Михаил',
    last_name: 'Волков',
    nickname: 'mike_volkov',
    bio: 'Разрабатываю приложения и играю на гитаре.',
  },
  {
    id: 'demo-sofia',
    first_name: 'София',
    last_name: 'Морозова',
    nickname: 'sofia_m',
    bio: 'Дизайн, книги и прогулки по городу.',
  },
];

function storageKey(ownerId: string): string {
  return `demo_contacts_v1:${ownerId}`;
}

function readContacts(ownerId: string): Record<string, string> {
  const raw = localStorage.getItem(storageKey(ownerId));
  if (!raw) return { 'demo-anna': 'Анна', 'demo-mikhail': 'Михаил' };
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
    throw new Error('Invalid contacts');
  return Object.fromEntries(
    Object.entries(parsed).filter(
      ([id, name]) =>
        DEMO_PROFILES.some((profile) => profile.id === id) && typeof name === 'string',
    ),
  );
}

function toContact(profile: PublicProfileData, ownerId: string, pseudonym: string): Contact {
  return {
    user_id: ownerId,
    contact_user_id: profile.id,
    pseudonym,
    nickname: profile.nickname,
    first_name: profile.first_name,
    last_name: profile.last_name,
    is_online: false,
    created_at: '',
    updated_at: '',
  };
}

export async function mockGetContacts(ownerId: string): Promise<ApiResult<ContactsResponse>> {
  try {
    const contacts = readContacts(ownerId);
    return new ApiSuccess(
      DEMO_PROFILES.filter(
        (profile) =>
          profile.id !== ownerId && Object.prototype.hasOwnProperty.call(contacts, profile.id),
      ).map((profile) => toContact(profile, ownerId, contacts[profile.id])),
      200,
    );
  } catch {
    return new ApiError('LOCAL_STORAGE_ERROR', 'Не удалось прочитать локальные контакты', 0);
  }
}

export async function mockGetUserProfile(id: string): Promise<ApiResult<PublicProfileData>> {
  const profile = DEMO_PROFILES.find((item) => item.id === id);
  return profile
    ? new ApiSuccess({ ...profile }, 200)
    : new ApiError('NOT_FOUND', 'Пользователь не найден', 404);
}

export async function mockSaveContact(
  ownerId: string,
  id: string,
  pseudonym: string | null,
): Promise<ApiResult<null>> {
  if (ownerId === id || !DEMO_PROFILES.some((profile) => profile.id === id)) {
    return new ApiError('INVALID_CONTACT', 'Нельзя изменить этот контакт', 400);
  }
  try {
    const contacts = readContacts(ownerId);
    if (pseudonym === null) delete contacts[id];
    else contacts[id] = pseudonym;
    localStorage.setItem(storageKey(ownerId), JSON.stringify(contacts));
    return new ApiSuccess(null, 200);
  } catch {
    return new ApiError('LOCAL_STORAGE_ERROR', 'Не удалось сохранить контакты в браузере', 0);
  }
}

export async function mockAddContact(
  ownerId: string,
  nickname: string,
  pseudonym: string,
): Promise<ApiResult<null>> {
  const profile = DEMO_PROFILES.find((item) => item.nickname === nickname);
  if (!profile) return new ApiError('NOT_FOUND', 'Пользователь не найден', 404);
  return mockSaveContact(ownerId, profile.id, pseudonym);
}
