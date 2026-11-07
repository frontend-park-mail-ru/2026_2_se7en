import { ApiSuccess } from '@/api/ApiResponse';
import { ProfileApi } from '@/api/profile/ProfileApi';
import type { ProfileData } from '@/api/profile/profile.types';
import type { ProfileTab } from '@/components/profile/profile.types';
import { Signal } from '@/reactive/Signal';

const VALID_TABS: ProfileTab[] = ['public', 'security', 'phone', 'password'];

let cachedProfile: ProfileData | null = null;

/**
 * Модель страницы профиля.
 */
export class ProfilePageModel {
  readonly activeTab = new Signal<ProfileTab>(this.getTabFromUrl());
  readonly profile = new Signal<ProfileData | null>(cachedProfile);

  private getTabFromUrl(): ProfileTab {
    const tab = window.location.pathname.split('/')[2] as ProfileTab | undefined;
    return tab && VALID_TABS.includes(tab) ? tab : 'security';
  }

  async loadProfile(): Promise<void> {
    this.activeTab.value = this.getTabFromUrl();
    if (cachedProfile) return;

    const res = await ProfileApi.getProfile();
    if (res instanceof ApiSuccess) {
      cachedProfile = res.data;
      this.profile.value = res.data;
    }
  }
}
