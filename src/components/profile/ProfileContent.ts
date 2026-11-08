import { BannerErrorIcon } from '@/components/core/Icons';
import { PROFILE_TEXTS } from '@/constants/Profile';
import { ProfileCard } from '@/components/profile/ProfileCard';
import type { ProfileData } from '@/api/profile/profile.types';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ProfileMenu } from '@/components/profile/ProfileMenu';
import { ProfileSecurity } from '@/components/profile/ProfileSecurity';
import { escapeHtml } from '@/helpers/EscapeHtml';
import type { FormFieldParams, ProfileContentParams } from './profile.types';

/**
 * Генерирует HTML разметку формы публичного профиля.
 *
 * @param profile - Данные профиля пользователя.
 * @returns Строка HTML с формой публичных данных.
 */
function renderPublicForm(profile: ProfileData): string {
  const fields: FormFieldParams[] = [
    {
      id: 'first_name',
      name: 'first_name',
      label: PROFILE_TEXTS.LABEL_NAME,
      value: profile.first_name,
    },
    {
      id: 'last_name',
      name: 'last_name',
      label: PROFILE_TEXTS.LABEL_SURNAME,
      value: profile.last_name || '',
      hint: PROFILE_TEXTS.HINT_OPTIONAL,
    },
    {
      id: 'nickname',
      name: 'nickname',
      label: PROFILE_TEXTS.LABEL_NICKNAME,
      value: profile.nickname,
    },
  ];
  return ProfileForm({ fields });
}

/**
 * Генерирует HTML разметку формы изменения номера телефона.
 *
 * @param profile - Данные профиля пользователя.
 * @returns Строка HTML с формой телефона.
 */
function renderPhoneForm(profile: ProfileData): string {
  const fields: FormFieldParams[] = [
    {
      id: 'phone',
      name: 'phone',
      label: PROFILE_TEXTS.LABEL_PHONE,
      value: profile.phone_number || '',
    },
  ];
  return ProfileForm({ fields });
}

/**
 * Генерирует HTML разметку формы изменения почты.
 *
 * @param profile - Данные профиля пользователя.
 * @returns Строка HTML с формой почты.
 */
function renderEmailForm(profile: ProfileData): string {
  const fields: FormFieldParams[] = [
    {
      id: 'email',
      name: 'email',
      label: PROFILE_TEXTS.LABEL_EMAIL,
      type: 'email',
      value: profile.email,
    },
  ];
  return ProfileForm({ fields });
}

/**
 * Генерирует HTML разметку формы смены пароля.
 *
 * @returns Строка HTML с формой смены пароля.
 */
function renderPasswordForm(): string {
  const fields: FormFieldParams[] = [
    {
      id: 'old_password',
      name: 'old_password',
      label: PROFILE_TEXTS.LABEL_OLD_PASSWORD,
      type: 'password',
      isPassword: true,
    },
    {
      id: 'new_password',
      name: 'new_password',
      label: PROFILE_TEXTS.LABEL_NEW_PASSWORD,
      type: 'password',
      isPassword: true,
      hint: PROFILE_TEXTS.HINT_PASSWORD_LENGTH,
    },
    {
      id: 'confirm_password',
      name: 'confirm_password',
      label: PROFILE_TEXTS.LABEL_CONFIRM_PASSWORD,
      type: 'password',
      isPassword: true,
    },
  ];
  return ProfileForm({ fields });
}

/**
 * Основной компонент содержимого страницы профиля.
 *
 * @param params - Параметры отображения контента профиля.
 * @returns Строка HTML с контентом страницы.
 */
export function ProfileContent({ profile, activeTab, errorMessage }: ProfileContentParams): string {
  if (errorMessage) {
    return `
      <div class="profile-page">
        <aside class="profile-page__sidebar">
          ${ProfileMenu(activeTab)}
        </aside>
        <main class="profile-page__main">
          <div class="profile-page__content">
            <div class="profile-page__error" role="alert">
              ${BannerErrorIcon}
              <p>${escapeHtml(errorMessage)}</p>
            </div>
          </div>
        </main>
      </div>
    `;
  }

  if (!profile) {
    return `
      <div class="profile-page">
        <aside class="profile-page__sidebar">
          ${ProfileMenu(activeTab)}
        </aside>
        <main class="profile-page__main">
          <div class="profile-page__loading">Загрузка…</div>
        </main>
      </div>
    `;
  }

  let headerTitle = '';
  let cardSubtitle = '';
  let contentHtml = '';

  switch (activeTab) {
    case 'public':
      headerTitle = PROFILE_TEXTS.TITLE_PUBLIC;
      cardSubtitle = PROFILE_TEXTS.SUBTITLE_PUBLIC;
      contentHtml = renderPublicForm(profile);
      break;
    case 'phone':
      headerTitle = PROFILE_TEXTS.TITLE_PHONE;
      cardSubtitle = PROFILE_TEXTS.SUBTITLE_SECURITY;
      contentHtml = renderPhoneForm(profile);
      break;
    case 'password':
      headerTitle = PROFILE_TEXTS.TITLE_PASSWORD;
      cardSubtitle = PROFILE_TEXTS.SUBTITLE_SECURITY;
      contentHtml = renderPasswordForm();
      break;
    case 'email':
      headerTitle = PROFILE_TEXTS.TITLE_EMAIL;
      cardSubtitle = PROFILE_TEXTS.SUBTITLE_SECURITY;
      contentHtml = renderEmailForm(profile);
      break;
    case 'security':
    default:
      headerTitle = PROFILE_TEXTS.TITLE_SECURITY;
      cardSubtitle = PROFILE_TEXTS.SUBTITLE_SECURITY;
      contentHtml = ProfileSecurity({
        email: profile.email,
        phone: profile.phone_number || '',
        passwordMask: PROFILE_TEXTS.PASSWORD_MASK,
      });
      break;
  }

  const displayName = profile.first_name || PROFILE_TEXTS.FALLBACK_NAME;

  return `
    <div class="profile-page">
      <aside class="profile-page__sidebar">
        ${ProfileMenu(activeTab)}
      </aside>
      <main class="profile-page__main">
        <header class="profile-page__header">
          <h1 class="profile-page__title">${headerTitle}</h1>
        </header>

        <div class="profile-page__content">
          ${ProfileCard({ name: displayName, subtitle: cardSubtitle })}
          ${contentHtml}
        </div>
      </main>
    </div>
  `;
}
