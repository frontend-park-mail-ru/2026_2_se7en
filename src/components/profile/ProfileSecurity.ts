import './ProfileSecurity.scss';
import { Button } from '@/components/core/Button';
import { escapeHtml } from '@/helpers/EscapeHtml';
import { PROFILE_TEXTS } from '@/constants/Profile';
import type { ProfileSecurityParams, SecurityRow } from './profile.types';

/**
 * Компонент для отображения данных безопасности.
 */
export function ProfileSecurity({ email, phone, passwordMask }: ProfileSecurityParams): string {
  const rows: SecurityRow[] = [
    { label: PROFILE_TEXTS.LABEL_EMAIL, value: email, target: 'public' },
    { label: PROFILE_TEXTS.LABEL_PHONE, value: phone, target: 'phone' },
    { label: PROFILE_TEXTS.LABEL_PASSWORD, value: passwordMask, target: 'password' },
  ];

  return `
    <div class="profile-security">
      ${rows
        .map(
          (row) => `
        <div class="profile-security__row">
          <div class="profile-security__info">
            <span class="profile-security__label">${escapeHtml(row.label)}</span>
            <span class="profile-security__value">${escapeHtml(row.value)}</span>
          </div>
          ${Button({
            text: PROFILE_TEXTS.BTN_CHANGE,
            mode: 'ghost',
            className: 'profile-security__btn',
            attrs: { 'data-edit-tab': row.target },
          })}
        </div>
      `,
        )
        .join('')}
    </div>
  `;
}
