import { ApiSuccess } from '@/api/ApiResponse';
import { ProfileApi } from '@/api/profile/ProfileApi';
import type { ProfileData } from '@/api/profile/profile.types';
import type { ProfileTab } from '@/components/profile/Profile.types';
import { Signal } from '@/reactive/Signal';

const VALID_TABS: ProfileTab[] = ['public', 'security', 'email', 'phone', 'password'];

/**
 * Модель страницы профиля.
 */
export class ProfilePageModel {
  readonly activeTab = new Signal<ProfileTab>(this.getTabFromUrl());
  readonly profile = new Signal<ProfileData | null>(null);
  readonly errorMessage = new Signal<string | null>(null);

  private getTabFromUrl(): ProfileTab {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const tab = segments[1] as ProfileTab | undefined;

    return tab && VALID_TABS.includes(tab) ? tab : 'security';
  }

  async loadProfile(): Promise<void> {
    this.activeTab.value = this.getTabFromUrl();
    this.errorMessage.value = null;

    const res = await ProfileApi.getProfile();
    if (res instanceof ApiSuccess) {
      this.profile.value = res.data;
    } else {
      this.errorMessage.value = 'Сервис временно недоступен. Попробуйте позже';
    }
  }
}
