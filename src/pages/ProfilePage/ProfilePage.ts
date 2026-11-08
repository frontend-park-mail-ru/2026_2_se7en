import './ProfilePage.scss';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { Page } from '@/pages/Page';
import { ProfileContent } from '@/components/profile/ProfileContent';
import type { ProfileTab } from '@/components/profile/profile.types';
import { ROUTES } from '@/constants/Routes';
import { bindPasswordToggles } from '@/helpers/PasswordToggle';
import { router } from '@/helpers/Router';
import { ProfilePageModel, VALID_TABS } from './ProfilePage.model';

/**
 * Страница профиля.
 */
export class ProfilePage extends Page {
  static route = ROUTES.PROFILE;

  private readonly layout = new DefaultLayout();
  private readonly model = new ProfilePageModel();

  constructor() {
    super();

    this.setSubscribers([this.model.activeTab, this.model.profile, this.model.errorMessage], () =>
      this.update(),
    );
  }

  render(): string {
    return this.layout.render(
      ProfileContent({
        profile: this.model.profile.value,
        activeTab: this.model.activeTab.value,
        errorMessage: this.model.errorMessage.value,
      }),
    );
  }

  async afterMount(): Promise<void> {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const tab = segments[1];

    if (!tab || !VALID_TABS.includes(tab as ProfileTab)) {
      void router.goTo(ROUTES.PROFILE_SECURITY, { replace: true });
      return;
    }

    await this.model.loadProfile();
  }

  bindEvents(): void {
    this.layout.bindEvents();

    if (this.container) {
      bindPasswordToggles(this.container);
    }
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
