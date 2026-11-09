import './ProfileOverview.scss';
import { PROFILE_TEXTS } from '@/constants/Profile';
import { escapeHtml } from '@/helpers/EscapeHtml';
import type { ProfileData, PublicProfileData } from '@/api/profile/profile.types';

export function ProfileOverview(profile: ProfileData, isOwnProfile?: true): string;
export function ProfileOverview(profile: PublicProfileData, isOwnProfile: false): string;
export function ProfileOverview(
  profile: ProfileData | PublicProfileData,
  isOwnProfile = true,
): string {
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();
  const displayName = name || PROFILE_TEXTS.FALLBACK_NAME;
  const initial = Array.from(displayName)[0].toLocaleUpperCase('ru-RU');
  let avatarUrl = '';

  if (profile.icon_url) {
    try {
      const url = new URL(profile.icon_url, window.location.origin);
      if (['http:', 'https:'].includes(url.protocol)) avatarUrl = url.href;
    } catch {
      avatarUrl = '';
    }
  }

  const rows = [
    { label: 'Имя', value: profile.first_name },
    { label: 'Фамилия', value: profile.last_name },
    { label: 'Никнейм', value: profile.nickname ? `@${profile.nickname}` : null },
  ];

  const renderRows = (items: Array<{ label: string; value?: string | null }>): string =>
    items
      .map(
        ({ label, value }) => `
    <div class="profile-overview__row">
      <dt>${label}</dt>
      <dd${value?.trim() ? '' : ' class="profile-overview__muted"'}>${escapeHtml(value?.trim() || 'Не указано')}</dd>
    </div>
  `,
      )
      .join('');

  return `
    <article class="profile-overview" aria-label="Данные профиля">
      <div class="profile-overview__cover" aria-hidden="true"></div>
      <div class="profile-overview__body">
        <div class="profile-overview__avatar" role="img" aria-label="Аватар ${escapeHtml(displayName)}">
          <span aria-hidden="true">${escapeHtml(initial)}</span>
          ${avatarUrl ? `<img src="${escapeHtml(avatarUrl)}" alt="" data-profile-avatar>` : ''}
        </div>
        <h2 class="profile-overview__name">${escapeHtml(displayName)}</h2>
        ${profile.nickname ? `<p class="profile-overview__nickname">@${escapeHtml(profile.nickname)}</p>` : ''}
        ${isOwnProfile ? '' : '<div class="profile-overview__actions" data-profile-contact-actions></div>'}
        <section class="profile-overview__section" aria-labelledby="profile-public-title">
          <h3 id="profile-public-title" class="profile-overview__heading">Публичная информация</h3>
          ${isOwnProfile ? '<p class="profile-overview__description">Эти данные видят другие пользователи</p>' : ''}
          <dl class="profile-overview__details">${renderRows(rows)}</dl>
          <h4 class="profile-overview__heading profile-overview__about-title">О себе</h4>
          <p class="profile-overview__bio${profile.bio?.trim() ? '' : ' profile-overview__muted'}">${escapeHtml(profile.bio?.trim() || 'Описание пока не добавлено')}</p>
        </section>
        ${
          isOwnProfile && 'email' in profile
            ? `
          <section class="profile-overview__section" aria-labelledby="profile-private-title">
            <h3 id="profile-private-title" class="profile-overview__heading">Личная информация</h3>
            <p class="profile-overview__description">Видна только вам</p>
            <dl class="profile-overview__details">${renderRows([
              { label: 'Почта', value: profile.email },
              { label: 'Телефон', value: profile.phone_number },
            ])}</dl>
          </section>
        `
            : ''
        }
      </div>
    </article>
  `;
}
