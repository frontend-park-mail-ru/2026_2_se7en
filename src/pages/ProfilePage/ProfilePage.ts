import './ProfilePage.scss';
import { Page } from '@/pages/Page';
import { ROUTES } from '@/constants/Routes';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { ProfileMenu } from '@/components/profile/ProfileMenu';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProfileSecurity } from '@/components/profile/ProfileSecurity';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { PROFILE_TEXTS } from '@/constants/Profile';
import type { ProfileTab, FormFieldParams } from '@/components/profile/profile.types';
import type { ProfileData } from '@/api/profile/profile.types';
import { ProfileApi } from '@/api/profile/ProfileApi';

/**
 * Страница профиля. Только верстка, без логики.
 */
export class ProfilePage extends Page {
  static route = ROUTES.PROFILE;

  private readonly layout = new DefaultLayout();
  private activeTab: ProfileTab = 'security';
  private profile: ProfileData | null = null;

  render(): string {
    return this.layout.render(this.renderContent());
  }

  private renderContent(): string {
    if (!this.profile) return '';

    let headerTitle = '';
    let cardSubtitle = '';
    let contentHtml = '';

    if (this.activeTab === 'security') {
      headerTitle = PROFILE_TEXTS.TITLE_SECURITY;
      cardSubtitle = PROFILE_TEXTS.SUBTITLE_SECURITY;
      contentHtml = ProfileSecurity({
        email: this.profile.email,
        phone: this.profile.phone_number || '',
        passwordMask: PROFILE_TEXTS.PASSWORD_MASK,
      });
    } else if (this.activeTab === 'public') {
      headerTitle = PROFILE_TEXTS.TITLE_PUBLIC;
      cardSubtitle = PROFILE_TEXTS.SUBTITLE_PUBLIC;
      contentHtml = this.renderPublicForm();
    } else if (this.activeTab === 'phone') {
      headerTitle = PROFILE_TEXTS.TITLE_PHONE;
      cardSubtitle = PROFILE_TEXTS.SUBTITLE_SECURITY;
      contentHtml = this.renderPhoneForm();
    } else if (this.activeTab === 'password') {
      headerTitle = PROFILE_TEXTS.TITLE_PASSWORD;
      cardSubtitle = PROFILE_TEXTS.SUBTITLE_SECURITY;
      contentHtml = this.renderPasswordForm();
    }

    const displayName = this.profile.first_name || PROFILE_TEXTS.FALLBACK_NAME;

    return `
      <div class="profile-page">
        <aside class="profile-page__sidebar">
          ${ProfileMenu(this.activeTab)}
        </aside>
        <main class="profile-page__main">
          <header class="profile-page__header">
            <h1 class="profile-page__title">${headerTitle}</h1>
          </header>

          <div class="profile-page__content">
            ${ProfileCard({ name: displayName, subtitle: cardSubtitle })}
            ${contentHtml}
          </div>
        </main>
      </div>
    `;
  }

  private renderPublicForm(): string {
    if (!this.profile) return '';

    const fields: FormFieldParams[] = [
      {
        id: 'first_name',
        name: 'first_name',
        label: PROFILE_TEXTS.LABEL_NAME,
        value: this.profile.first_name,
      },
      {
        id: 'last_name',
        name: 'last_name',
        label: PROFILE_TEXTS.LABEL_SURNAME,
        value: this.profile.last_name || '',
        hint: PROFILE_TEXTS.HINT_OPTIONAL,
      },
      {
        id: 'nickname',
        name: 'nickname',
        label: PROFILE_TEXTS.LABEL_NICKNAME,
        value: this.profile.nickname,
      },
    ];
    return ProfileForm({ fields });
  }

  private renderPhoneForm(): string {
    if (!this.profile) return '';

    const fields: FormFieldParams[] = [
      {
        id: 'phone',
        name: 'phone',
        label: PROFILE_TEXTS.LABEL_PHONE,
        value: this.profile.phone_number || '',
      },
    ];
    return ProfileForm({ fields });
  }

  private renderPasswordForm(): string {
    const fields: FormFieldParams[] = [
      {
        id: 'old_password',
        name: 'old_password',
        label: PROFILE_TEXTS.LABEL_OLD_PASSWORD,
        type: 'password',
        isPassword: true,
      },
      {
        id: 'new_password',
        name: 'new_password',
        label: PROFILE_TEXTS.LABEL_NEW_PASSWORD,
        type: 'password',
        isPassword: true,
        hint: PROFILE_TEXTS.HINT_PASSWORD_LENGTH,
      },
      {
        id: 'confirm_password',
        name: 'confirm_password',
        label: PROFILE_TEXTS.LABEL_CONFIRM_PASSWORD,
        type: 'password',
        isPassword: true,
      },
    ];
    return ProfileForm({ fields });
  }

  async afterMount(): Promise<void> {
    const res = await ProfileApi.getProfile();
    if (res.success) {
      this.profile = res.data;
      this.update();
    }
  }

  bindEvents(): void {
    this.layout.bindEvents();

    // Переключение вкладок меню
    this.container?.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        this.activeTab = (e.currentTarget as HTMLElement).dataset.tab as ProfileTab;
        this.update();
      });
    });

    // Кнопки "Изменить" в блоке безопасности
    this.container?.querySelectorAll('[data-edit-tab]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        this.activeTab = (e.currentTarget as HTMLElement).dataset.editTab as ProfileTab;
        this.update();
      });
    });

    // Отмена
    document.getElementById('profile-cancel-btn')?.addEventListener('click', () => {
      this.activeTab = 'security';
      this.update();
    });

    // Сабмит — пока просто preventDefault
    document.getElementById('profile-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
    });

    // Показать/скрыть пароль
    this.container?.querySelectorAll('[data-toggle-password]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const inputId = (btn as HTMLElement).dataset.togglePassword;
        if (!inputId) return;
        const input = document.getElementById(inputId) as HTMLInputElement;
        if (!input) return;
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.querySelector('[data-eye="open"]')?.classList.toggle('is-hidden', show);
        btn.querySelector('[data-eye="closed"]')?.classList.toggle('is-hidden', !show);
      });
    });
  }

  private update(): void {
    if (!this.container) return;
    this.container.innerHTML = this.render();
    this.bindEvents();
  }

  unmount(): void {
    this.layout.unmount();
    super.unmount();
  }
}
