import './ProfilePage.scss';
import { Page } from '@/pages/Page';
import { ROUTES } from '@/constants/Routes';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { ProfileMenu, type ProfileTab } from '@/components/profile/ProfileMenu';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProfileSecurity } from '@/components/profile/ProfileSecurity';
import { ProfileForm, type FormFieldParams } from '@/components/profile/ProfileForm';

// пока замоканное все

export class ProfilePage extends Page {
  static route = ROUTES.PROFILE;

  private readonly layout = new DefaultLayout();
  private activeTab: ProfileTab = 'security';

  private readonly profile = {
    name: 'Влад',
    surname: 'Мазанов',
    nickname: 'xah7p',
    email: 'xah7p@yandex.ru',
    phone: '+7 (999) 123-45-67',
  };

  render(): string {
    return this.layout.render(this.renderContent());
  }

  private renderContent(): string {
    let headerTitle = '';
    let cardSubtitle = '';
    let contentHtml = '';

    if (this.activeTab === 'security') {
      headerTitle = 'Аккаунт и безопасность';
      cardSubtitle = 'Аккаунт и безопасность';
      contentHtml = ProfileSecurity({
        email: this.profile.email,
        phone: this.profile.phone,
        passwordMask: '•••••••••••',
      });
    } else if (this.activeTab === 'public') {
      headerTitle = 'Профиль';
      cardSubtitle = 'Публичный профиль';
      contentHtml = this.renderPublicForm();
    } else if (this.activeTab === 'phone') {
      headerTitle = 'Новый телефон';
      cardSubtitle = 'Аккаунт и безопасность';
      contentHtml = this.renderPhoneForm();
    } else if (this.activeTab === 'password') {
      headerTitle = 'Новый пароль';
      cardSubtitle = 'Аккаунт и безопасность';
      contentHtml = this.renderPasswordForm();
    }

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
            ${ProfileCard({ name: this.profile.name, subtitle: cardSubtitle })}
            ${contentHtml}
          </div>
        </main>
      </div>
    `;
  }

  private renderPublicForm(): string {
    const fields: FormFieldParams[] = [
      { id: 'name', name: 'name', label: 'Имя', value: this.profile.name },
      {
        id: 'surname',
        name: 'surname',
        label: 'Фамилия',
        value: this.profile.surname,
        hint: 'Необязательно',
      },
      { id: 'nickname', name: 'nickname', label: 'Никнейм', value: this.profile.nickname },
    ];
    return ProfileForm({ fields });
  }

  private renderPhoneForm(): string {
    const fields: FormFieldParams[] = [
      { id: 'phone', name: 'phone', label: 'Новый телефон', value: this.profile.phone },
    ];
    return ProfileForm({ fields });
  }

  private renderPasswordForm(): string {
    const fields: FormFieldParams[] = [
      {
        id: 'old_password',
        name: 'old_password',
        label: 'Старый пароль',
        type: 'password',
        isPassword: true,
      },
      {
        id: 'new_password',
        name: 'new_password',
        label: 'Новый пароль',
        type: 'password',
        isPassword: true,
        hint: '8–16 символов',
      },
      {
        id: 'confirm_password',
        name: 'confirm_password',
        label: 'Подтвердите новый пароль',
        type: 'password',
        isPassword: true,
      },
    ];
    return ProfileForm({ fields });
  }

  bindEvents(): void {
    this.layout.bindEvents();

    this.container?.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = (e.currentTarget as HTMLElement).dataset.tab as ProfileTab;
        this.activeTab = target;
        this.update();
      });
    });

    this.container?.querySelectorAll('[data-edit-tab]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = (e.currentTarget as HTMLElement).dataset.editTab as ProfileTab;
        this.activeTab = target;
        this.update();
      });
    });

    document.getElementById('profile-cancel-btn')?.addEventListener('click', () => {
      this.activeTab = 'security';
      this.update();
    });

    document.getElementById('profile-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
    });

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
