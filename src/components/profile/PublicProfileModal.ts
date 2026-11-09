import './PublicProfileModal.scss';
import { Button } from '@/components/core/Button.ts';
import { ProfileCard } from '@/components/profile/ProfileCard.ts';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';

export interface PublicProfileView {
  userId: string;
  firstName: string;
  lastName?: string | null;
  nickname: string;
  avatarUrl?: string | null;
  initials: string;
  isContact?: boolean;
  isAddingContact?: boolean;
}

/** Отображает публичные данные профиля поверх текущей страницы. */
export function PublicProfileModal(profile: PublicProfileView | null): string {
  if (!profile) return '';

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
  const displayName = fullName || profile.nickname || 'Пользователь';
  const valueOrFallback = (value?: string | null): string =>
    value?.trim() ? escapeHtml(value) : 'Не указано';

  return `
    <div class="public-profile-modal" data-public-profile-backdrop role="presentation">
      <section class="public-profile-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="public-profile-title">
        <header class="public-profile-modal__header">
          <h2 id="public-profile-title">Профиль</h2>
          ${Button({ text: '×', mode: 'unstyled', className: 'public-profile-modal__close', ariaLabel: 'Закрыть профиль', attrs: { 'data-public-profile-close': '' } })}
        </header>
        ${ProfileCard({ name: displayName, subtitle: 'Публичный профиль', avatarUrl: profile.avatarUrl, initials: profile.initials })}
        <dl class="public-profile-modal__details">
          <div class="public-profile-modal__field">
            <dt>Имя</dt>
            <dd>${valueOrFallback(profile.firstName)}</dd>
          </div>
          <div class="public-profile-modal__field">
            <dt>Фамилия</dt>
            <dd>${valueOrFallback(profile.lastName)}</dd>
          </div>
          <div class="public-profile-modal__field">
            <dt>Никнейм</dt>
            <dd>${valueOrFallback(profile.nickname)}</dd>
          </div>
        </dl>
        <div class="public-profile-modal__actions">
          ${Button({
            text: profile.isContact
              ? 'Уже в контактах'
              : profile.isAddingContact
                ? 'Добавляем…'
                : 'Добавить в контакты',
            mode: profile.isContact ? 'secondary' : 'primary',
            disabled: Boolean(profile.isContact || profile.isAddingContact),
            attrs:
              profile.isContact || profile.isAddingContact
                ? {}
                : { 'data-public-profile-add-contact': '' },
          })}
        </div>
      </section>
    </div>
  `;
}
