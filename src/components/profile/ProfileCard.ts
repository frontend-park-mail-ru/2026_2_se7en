import './ProfileCard.scss';
import type { ProfileCardParams } from './profile.types';
import { UserIcon } from '@/components/core/Icons';
import { escapeHtml } from '@/helpers/EscapeHtml';

/**
 * Карточка с аватаром и именем пользователя.
 */
export function ProfileCard({ name, subtitle }: ProfileCardParams): string {
  return `
    <div class="profile-card">
      <div class="profile-card__avatar">
        ${UserIcon}
      </div>
      <div class="profile-card__info">
        <h2 class="profile-card__name">${escapeHtml(name)}</h2>
        <p class="profile-card__subtitle">${escapeHtml(subtitle)}</p>
      </div>
    </div>
  `;
}
