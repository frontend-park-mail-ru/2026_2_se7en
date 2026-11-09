import './ProfileMenu.scss';
import { PROFILE_TEXTS } from '@/constants/Profile';
import type { ProfileTab } from './profile.types';

const MENU_ITEMS: Array<{ tab: ProfileTab; label: string }> = [
  { tab: 'overview', label: 'Мой профиль' },
  { tab: 'public', label: PROFILE_TEXTS.MENU_PUBLIC },
  { tab: 'security', label: PROFILE_TEXTS.MENU_SECURITY },
];

/**
 * Меню навигации по разделам профиля.
 */
export function ProfileMenu(activeTab: ProfileTab): string {
  return `
    <nav class="profile-menu">
      ${MENU_ITEMS.map(({ tab, label }) => {
        const isActive =
          tab === activeTab ||
          (tab === 'security' && ['email', 'phone', 'password'].includes(activeTab));

        return `
          <a
            href="${tab === 'overview' ? ROUTES.PROFILE : `/profile/${tab}`}"
            ${isActive ? 'aria-current="page"' : ''}
            class="profile-menu__item${isActive ? ' profile-menu__item_active' : ''}"
          >
            ${label}
          </a>
        `;
      }).join('')}
    </nav>
  `;
}
