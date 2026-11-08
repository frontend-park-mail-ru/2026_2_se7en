import './ProfilePage.scss';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { Page } from '@/pages/Page';
import { ProfileContent } from '@/components/profile/ProfileContent';
import type { ProfileField } from '@/api/profile/profile.types';
import type { ProfileTab } from '@/components/profile/Profile.types';
import { ROUTES } from '@/constants/Routes';
import { bindPasswordToggles } from '@/helpers/PasswordToggle';
import { eventBus } from '@/helpers/EventBus';
import { getProfileErrorMessage } from './profile.helpers';
import { renderFieldError } from '@/helpers/FieldError';
import { renderProfileFormError } from '@/components/profile/ProfileForm';
import { router } from '@/helpers/Router';
import { PROFILE_FORM_ID, PROFILE_SUBMIT_ID, PROFILE_TEXTS } from '@/constants/Profile';
import { ProfilePageModel, VALID_TABS } from './ProfilePage.model';

const ALL_PROFILE_FIELDS: ProfileField[] = [
  'first_name',
  'last_name',
  'nickname',
  'phone',
  'email',
  'old_password',
  'new_password',
  'confirm_password',
];

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
    this.setSubscribers([this.model.fieldErrors], () => this.updateFieldErrors());
    this.setSubscribers([this.model.formError], () => this.updateFormError());
    this.setSubscribers([this.model.isSubmitting], () => this.updateSubmittingState());
  }

  render(): string {
    return this.layout.render(
      ProfileContent({
        profile: this.model.profile.value,
        activeTab: this.model.activeTab.value,
        formValues: this.model.formValues,
        fieldErrors: this.model.fieldErrors.value,
        isSubmitting: this.model.isSubmitting.value,
        formError: this.model.formError.value,
        errorMessage: this.model.errorMessage.value,
      }),
    );
  }

  async afterMount(): Promise<void> {
    window.addEventListener('popstate', this.handlePopState);

    const segments = window.location.pathname.split('/').filter(Boolean);
    const tab = segments[1];

    if (!tab || !VALID_TABS.includes(tab as ProfileTab)) {
      window.history.replaceState({}, '', ROUTES.PROFILE_SECURITY);
      this.model.syncTabWithUrl();
    }

    await this.model.loadProfile();
  }

  bindEvents(): void {
    this.layout.bindEvents();

    const form = document.getElementById(PROFILE_FORM_ID);
    form?.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();
      eventBus.emit('profile:submit');
    });

    ALL_PROFILE_FIELDS.forEach((field) => {
      const input = document.getElementById(field);
      if (!(input instanceof HTMLInputElement)) return;

      input.addEventListener('input', () => {
        eventBus.emit('profile:field-change', { field, value: input.value });
      });

      input.addEventListener('blur', () => {
        eventBus.emit('profile:field-blur', { field });
      });
    });

    if (this.container) {
      bindPasswordToggles(this.container);
    }
  }

  private readonly handlePopState = (): void => {
    if (ROUTES.PROFILE_PATTERN.test(window.location.pathname)) {
      const segments = window.location.pathname.split('/').filter(Boolean);
      const tab = segments[1] as ProfileTab | undefined;

      if (!tab || !VALID_TABS.includes(tab)) {
        void router.goTo(ROUTES.PROFILE_SECURITY, { replace: true });
        return;
      }

      this.model.syncTabWithUrl();
    }
  };

  private updateFieldErrors(): void {
    if (!this.container) return;

    const errors = this.model.fieldErrors.value;

    ALL_PROFILE_FIELDS.forEach((field) => {
      const wrapper = this.container?.querySelector(`[data-form-field="${field}"]`);
      if (!wrapper) return;

      const message = getProfileErrorMessage(errors[field]);
      const hasError = Boolean(message);

      wrapper.querySelector('label')?.classList.toggle('profile-field__label_error', hasError);
      wrapper.querySelector('.input')?.classList.toggle('profile-field__input_error', hasError);

      const errorSlot = wrapper.querySelector('[data-field-error]');
      if (errorSlot) {
        errorSlot.innerHTML = renderFieldError(message, 'profile-field__error');
      }
    });
  }

  private updateFormError(): void {
    if (!this.container) return;

    const slot = this.container.querySelector('[data-form-error-slot]');
    if (slot) {
      slot.innerHTML = renderProfileFormError(this.model.formError.value);
    }
  }

  private updateSubmittingState(): void {
    const submitBtn = document.getElementById(PROFILE_SUBMIT_ID);
    if (!(submitBtn instanceof HTMLButtonElement)) return;

    const isSubmitting = this.model.isSubmitting.value;
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? PROFILE_TEXTS.BTN_SAVING : PROFILE_TEXTS.BTN_SAVE;
  }

  private update(): void {
    if (!this.container) return;
    this.container.innerHTML = this.render();
    this.bindEvents();
  }

  unmount(): void {
    window.removeEventListener('popstate', this.handlePopState);
    this.layout.unmount();
    this.model.destroy();
    super.unmount();
  }
}
