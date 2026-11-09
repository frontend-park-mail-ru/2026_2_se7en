import '@/pages/ProfilePage/ProfilePage.scss';
import { Button } from '@/components/core/Button';
import { ContactsApi } from '@/api/contacts/ContactsApi';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { Page } from '@/pages/Page';
import { ProfileContactActions } from '@/components/profile/ProfileContactActions';
import { ProfileOverview } from '@/components/profile/ProfileOverview';
import { ROUTES } from '@/constants/Routes';
import { USING_MOCK } from '@/api/api.constants';
import { UserProfilePageModel } from './UserProfilePage.model';
import { escapeHtml } from '@/helpers/EscapeHtml';
import { router } from '@/helpers/Router';
import { user } from '@/store/User';

export class UserProfilePage extends Page {
  private readonly layout = new DefaultLayout();
  private readonly model = new UserProfilePageModel();
  private contactActions: ProfileContactActions | null = null;

  constructor() {
    super();
    this.setSubscribers([this.model.state], () => this.update());
  }

  render(): string {
    const { profile, isLoading, error, contactsError } = this.model.state.value;
    return this.layout.render(`
      <div class="profile-page">
        <main class="profile-page__main">
          <header class="profile-page__header">
            <a href="${ROUTES.CONTACTS}" class="profile-overview__back">← К контактам</a>
            <h1 class="profile-page__title">Профиль пользователя</h1>
          </header>
          ${USING_MOCK.CONTACTS ? '<p class="profile-overview__notice">Демонстрационные профили. Контакты сохраняются в этом браузере.</p>' : ''}
          ${isLoading ? '<p class="profile-page__loading" role="status">Загрузка…</p>' : ''}
          ${
            error
              ? `<div class="profile-page__content">
            <p class="profile-page__error" role="alert">${escapeHtml(error)}</p>
            ${Button({ text: 'Попробовать ещё раз', mode: 'secondary', attrs: { 'data-user-profile-retry': '' } })}
          </div>`
              : ''
          }
          ${profile ? ProfileOverview(profile, false) : ''}
          ${
            contactsError
              ? `<div class="profile-page__content">
            <p class="profile-page__error" role="alert">${escapeHtml(contactsError)}</p>
            ${Button({ text: 'Повторить загрузку контактов', mode: 'secondary', attrs: { 'data-user-profile-retry': '' } })}
          </div>`
              : ''
          }
        </main>
      </div>
    `);
  }

  bindEvents(): void {
    this.layout.bindEvents();
    this.container
      ?.querySelector('[data-user-profile-retry]')
      ?.addEventListener('click', this.loadProfile);
    const avatar = this.container?.querySelector<HTMLImageElement>('[data-profile-avatar]');
    avatar?.addEventListener('error', () => avatar.remove(), { once: true });
    if (avatar?.complete && !avatar.naturalWidth) avatar.remove();

    const slot = this.container?.querySelector<HTMLElement>('[data-profile-contact-actions]');
    const { profile, isContact, pseudonym, contactsError } = this.model.state.value;
    if (!slot || !profile || contactsError) return;
    this.contactActions = new ProfileContactActions({
      isOwnProfile: profile.id === user.getId(),
      isContact,
      pseudonym,
      displayName:
        [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.nickname,
      addContact: (pseudonym) => ContactsApi.addContact(profile.nickname, pseudonym),
      removeContact: () => ContactsApi.removeContact(profile.id),
    });
    this.contactActions.mount(slot);
  }

  async afterMount(): Promise<void> {
    window.addEventListener('popstate', this.loadProfile);
    await this.loadProfile();
  }

  private readonly loadProfile = async (): Promise<void> => {
    if (!ROUTES.USER_PROFILE_PATTERN.test(window.location.pathname)) return;
    const id = decodeURIComponent(window.location.pathname.split('/')[2]);
    if (id === user.getId()) {
      await router.goTo(ROUTES.PROFILE, { replace: true });
      return;
    }
    await this.model.load(id);
  };

  private update(): void {
    if (!this.container) return;
    this.contactActions?.destroy();
    this.contactActions = null;
    this.container.innerHTML = this.render();
    this.bindEvents();
  }

  unmount(): void {
    window.removeEventListener('popstate', this.loadProfile);
    this.contactActions?.destroy();
    this.layout.unmount();
    super.unmount();
  }
}
