import './ProfileSecurity.scss';
import { Button } from '@/components/core/Button';
import { escapeHtml } from '@/helpers/EscapeHtml';

export interface SecurityRow {
  label: string;
  value: string;
  target: string;
}

export interface ProfileSecurityParams {
  email: string;
  phone: string;
  passwordMask: string;
}

export function ProfileSecurity({ email, phone, passwordMask }: ProfileSecurityParams): string {
  const rows: SecurityRow[] = [
    { label: 'Почта', value: email, target: 'public' },
    { label: 'Телефон', value: phone, target: 'phone' },
    { label: 'Пароль', value: passwordMask, target: 'password' },
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
            text: 'Изменить',
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
