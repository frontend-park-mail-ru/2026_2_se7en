import './ProfileMenu.scss';
import { Button } from '@/components/core/Button';
import { PROFILE_TEXTS } from '@/constants/Profile';
import type { ProfileTab } from './profile.types';

export function ProfileMenu(activeTab: ProfileTab): string {
  const isPublic = activeTab === 'public';
  const isSecurity = activeTab !== 'public';

  return `
    <nav class="profile-menu">
      ${Button({
        text: PROFILE_TEXTS.MENU_PUBLIC,
        mode: 'ghost',
        className: `profile-menu__item${isPublic ? ' profile-menu__item_active' : ''}`,
        attrs: { 'data-tab': 'public' },
      })}
      ${Button({
        text: PROFILE_TEXTS.MENU_SECURITY,
        mode: 'ghost',
        className: `profile-menu__item${isSecurity ? ' profile-menu__item_active' : ''}`,
        attrs: { 'data-tab': 'security' },
      })}
    </nav>
  `;
}
