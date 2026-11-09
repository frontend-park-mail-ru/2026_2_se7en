import { BannerErrorIcon } from '@/components/core/Icons';
import { PROFILE_TEXTS } from '@/constants/Profile';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ProfileMenu } from '@/components/profile/ProfileMenu';
import { ProfileSecurity } from '@/components/profile/ProfileSecurity';
import { ROUTES } from '@/constants/Routes';
import { escapeHtml } from '@/helpers/EscapeHtml';
import { getProfileErrorMessage } from '@/pages/ProfilePage/profile.helpers';
import type { FormFieldParams, FormRenderOptions, ProfileContentParams } from './profile.types';

/**
 * Генерирует HTML разметку формы публичного профиля.
 */
function renderPublicForm({ values, errors, isSubmitting, formError }: FormRenderOptions): string {
  const fields: FormFieldParams[] = [
    {
      id: 'first_name',
      name: 'first_name',
      label: PROFILE_TEXTS.LABEL_NAME,
      value: values.first_name,
      error: getProfileErrorMessage(errors.first_name),
    },
    {
      id: 'last_name',
      name: 'last_name',
      label: PROFILE_TEXTS.LABEL_SURNAME,
      value: values.last_name,
      hint: PROFILE_TEXTS.HINT_OPTIONAL,
      error: getProfileErrorMessage(errors.last_name),
    },
    {
      id: 'nickname',
      name: 'nickname',
      label: PROFILE_TEXTS.LABEL_NICKNAME,
      value: values.nickname,
      error: getProfileErrorMessage(errors.nickname),
    },
  ];
  return ProfileForm({
    fields,
    cancelHref: ROUTES.PROFILE_SECURITY,
    isSubmitting,
    formError,
  });
}

/**
 * Генерирует HTML разметку формы изменения номера телефона.
 */
function renderPhoneForm({ values, errors, isSubmitting, formError }: FormRenderOptions): string {
  const fields: FormFieldParams[] = [
    {
      id: 'phone',
      name: 'phone',
      label: PROFILE_TEXTS.LABEL_PHONE,
      value: values.phone,
      error: getProfileErrorMessage(errors.phone),
    },
  ];
  return ProfileForm({
    fields,
    cancelHref: ROUTES.PROFILE_SECURITY,
    isSubmitting,
    formError,
  });
}

/**
 * Генерирует HTML разметку формы изменения почты.
 */
function renderEmailForm({ values, errors, isSubmitting, formError }: FormRenderOptions): string {
  const fields: FormFieldParams[] = [
    {
      id: 'email',
      name: 'email',
      label: PROFILE_TEXTS.LABEL_EMAIL,
      type: 'email',
      value: values.email,
      error: getProfileErrorMessage(errors.email),
    },
  ];
  return ProfileForm({
    fields,
    cancelHref: ROUTES.PROFILE_SECURITY,
    isSubmitting,
    formError,
  });
}

/**
 * Генерирует HTML разметку формы смены пароля.
 */
function renderPasswordForm({
  values,
  errors,
  isSubmitting,
  formError,
}: FormRenderOptions): string {
  const fields: FormFieldParams[] = [
    {
      id: 'old_password',
      name: 'old_password',
      label: PROFILE_TEXTS.LABEL_OLD_PASSWORD,
      type: 'password',
      value: values.old_password,
      isPassword: true,
      error: getProfileErrorMessage(errors.old_password),
    },
    {
      id: 'new_password',
      name: 'new_password',
      label: PROFILE_TEXTS.LABEL_NEW_PASSWORD,
      type: 'password',
      value: values.new_password,
      isPassword: true,
      hint: PROFILE_TEXTS.HINT_PASSWORD_LENGTH,
      error: getProfileErrorMessage(errors.new_password),
    },
    {
      id: 'confirm_password',
      name: 'confirm_password',
      label: PROFILE_TEXTS.LABEL_CONFIRM_PASSWORD,
      type: 'password',
      value: values.confirm_password,
      isPassword: true,
      error: getProfileErrorMessage(errors.confirm_password),
    },
  ];
  return ProfileForm({
    fields,
    cancelHref: ROUTES.PROFILE_SECURITY,
    isSubmitting,
    formError,
  });
}

/**
 * Основной компонент содержимого страницы профиля.
 */
export function ProfileContent({
  profile,
  activeTab,
  formValues,
  fieldErrors,
  isSubmitting,
  formError,
  errorMessage,
}: ProfileContentParams): string {
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

  const formOptions: FormRenderOptions = {
    values: formValues,
    errors: fieldErrors,
    isSubmitting,
    formError,
  };

  switch (activeTab) {
    case 'public':
      headerTitle = PROFILE_TEXTS.TITLE_PUBLIC;
      cardSubtitle = PROFILE_TEXTS.SUBTITLE_PUBLIC;
      contentHtml = renderPublicForm(formOptions);
      break;
    case 'phone':
      headerTitle = PROFILE_TEXTS.TITLE_PHONE;
      cardSubtitle = PROFILE_TEXTS.SUBTITLE_SECURITY;
      contentHtml = renderPhoneForm(formOptions);
      break;
    case 'password':
      headerTitle = PROFILE_TEXTS.TITLE_PASSWORD;
      cardSubtitle = PROFILE_TEXTS.SUBTITLE_SECURITY;
      contentHtml = renderPasswordForm(formOptions);
      break;
    case 'email':
      headerTitle = PROFILE_TEXTS.TITLE_EMAIL;
      cardSubtitle = PROFILE_TEXTS.SUBTITLE_SECURITY;
      contentHtml = renderEmailForm(formOptions);
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
