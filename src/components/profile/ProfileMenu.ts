import './ProfileMenu.scss';

export type ProfileTab = 'public' | 'security' | 'phone' | 'password';

export function ProfileMenu(activeTab: ProfileTab): string {
  const isPublic = activeTab === 'public';
  const isSecurity = activeTab !== 'public';

  return `
    <nav class="profile-menu">
      <button data-tab="public" class="profile-menu__item${isPublic ? ' profile-menu__item_active' : ''}">
        Публичный профиль
      </button>
      <button data-tab="security" class="profile-menu__item${isSecurity ? ' profile-menu__item_active' : ''}">
        Аккаунт и безопасность
      </button>
    </nav>
  `;
}
