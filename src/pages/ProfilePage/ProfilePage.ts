import './ProfilePage.scss';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { Page } from '@/pages/Page';
import { ProfileContent } from '@/components/profile/ProfileContent';
import { ProfilePageModel } from './ProfilePage.model';
import { ROUTES } from '@/constants/Routes';
import { bindPasswordToggles } from '@/helpers/PasswordToggle';

/**
 * Страница профиля. Только верстка, без логики.
 */
export class ProfilePage extends Page {
  static route = ROUTES.PROFILE;

  private readonly layout = new DefaultLayout();
  private readonly model = new ProfilePageModel();

  constructor() {
    super();

    this.setSubscribers([this.model.activeTab, this.model.profile], () => this.update());
  }

  render(): string {
    return this.layout.render(
      ProfileContent({
        profile: this.model.profile.value,
        activeTab: this.model.activeTab.value,
      }),
    );
  }

  async afterMount(): Promise<void> {
    await this.model.loadProfile();
  }

  bindEvents(): void {
    this.layout.bindEvents();

    document.getElementById('profile-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
    });

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
