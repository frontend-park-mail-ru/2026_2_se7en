import type { Contact } from '@/api/contacts/contacts.types.ts';
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
    const [profile, contactLookup] = await Promise.all([
      ProfileApi.getUserProfile(id),
      this.findContact(id),
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
    const contact = contactLookup.contact;
    this.state.value = {
      profile: profile.data,
      isLoading: false,
      error: null,
      contactsError: contactLookup.error,
      isContact: Boolean(contact),
      pseudonym: contact?.pseudonym ?? null,
    };
  }

  private async findContact(
    id: string,
  ): Promise<{ contact: Contact | undefined; error: string | null }> {
    const pageSize = 20;
    let offset = 0;

    while (true) {
      const result = await ContactsApi.getContacts({ limit: pageSize, offset });
      if (!result.success) {
        return {
          contact: undefined,
          error: 'Не удалось загрузить контакты. Попробуйте ещё раз.',
        };
      }

      const contact = result.data.find((item) => item.contact_user_id === id);
      if (contact) return { contact, error: null };
      if (result.data.length < pageSize) return { contact: undefined, error: null };
      offset += result.data.length;
    }
  }
}
