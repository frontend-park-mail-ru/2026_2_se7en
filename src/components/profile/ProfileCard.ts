import './ProfileCard.scss';
import type { ProfileCardParams } from './profile.types';
import { escapeHtml } from '@/helpers/EscapeHtml';
import { CameraIcon, UserIcon } from '@/components/core/Icons';

/**
 * Карточка с аватаром и именем пользователя.
 */
export function ProfileCard({
  name,
  subtitle,
  avatarUrl,
  initials,
  canChangeAvatar = false,
  isAvatarUploading = false,
}: ProfileCardParams): string {
  const avatarContent = avatarUrl
    ? `<img src="${escapeHtml(avatarUrl)}" alt="">`
    : initials
      ? escapeHtml(initials)
      : UserIcon;
  const avatar = canChangeAvatar
    ? `
      <button
        class="profile-card__avatar profile-card__avatar_button${isAvatarUploading ? ' profile-card__avatar_uploading' : ''}"
        type="button"
        data-profile-avatar-trigger
        aria-label="Изменить фотографию профиля"
        title="Изменить фотографию профиля"
        ${isAvatarUploading ? 'disabled' : ''}
      >
        ${avatarContent}
        <span class="profile-card__avatar-overlay" aria-hidden="true">${isAvatarUploading ? 'Загрузка' : CameraIcon}</span>
      </button>
      <input class="profile-card__avatar-input" type="file" accept="image/png,image/jpeg,image/webp" data-profile-avatar-input aria-label="Выберите фотографию профиля">
    `
    : `<div class="profile-card__avatar">${avatarContent}</div>`;

  return `
    <div class="profile-card">
      ${avatar}
      <div class="profile-card__info">
        <h2 class="profile-card__name">${escapeHtml(name)}</h2>
        <p class="profile-card__subtitle">${escapeHtml(subtitle)}</p>
      </div>
    </div>
  `;
}
