import { ContactsApi } from '@/api/contacts/ContactsApi';
import { ProfileApi } from '@/api/profile/ProfileApi';
import type { PublicProfileData } from '@/api/profile/profile.types';
import { Signal } from '@/reactive/Signal';

interface UserProfileState {
  profile: PublicProfileData | null;
  isLoading: boolean;
  isContact: boolean;
  pseudonym: string | null;
  error: string | null;
  contactsError: string | null;
}

export class UserProfilePageModel {
  readonly state = new Signal<UserProfileState>({
    profile: null,
    isLoading: true,
    isContact: false,
    pseudonym: null,
    error: null,
    contactsError: null,
  });

  async load(id: string): Promise<void> {
    this.state.value = {
      profile: null,
      isLoading: true,
      isContact: false,
      pseudonym: null,
      error: null,
      contactsError: null,
    };
    const [profile, contacts] = await Promise.all([
      ProfileApi.getUserProfile(id),
      ContactsApi.getContacts(),
    ]);
    if (profile.success === false) {
      this.state.value = {
        profile: null,
        isLoading: false,
        isContact: false,
        pseudonym: null,
        error: profile.message,
        contactsError: null,
      };
      return;
    }
    const contact =
      contacts.success === true
        ? contacts.data.find((item) => item.contact_user_id === id)
        : undefined;
    this.state.value = {
      profile: profile.data,
      isLoading: false,
      error: null,
      contactsError:
        contacts.success === false ? 'Не удалось загрузить контакты. Попробуйте ещё раз.' : null,
      isContact: Boolean(contact),
      pseudonym: contact?.pseudonym ?? null,
    };
  }
}
