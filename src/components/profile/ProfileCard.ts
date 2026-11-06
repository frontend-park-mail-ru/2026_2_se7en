import './ProfileCard.scss';
import { UserIcon } from '@/components/core/Icons';
import { escapeHtml } from '@/helpers/EscapeHtml';

export interface ProfileCardParams {
  name: string;
  subtitle: string;
}

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
