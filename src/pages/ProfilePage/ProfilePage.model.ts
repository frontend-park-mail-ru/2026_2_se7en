import { DEFAULT_ERROR_MESSAGE } from '@/api/error.constants';
import { ProfileApi } from '@/api/profile/ProfileApi';
import type { ProfileTab } from '@/components/profile/Profile.types';
import { ROUTES } from '@/constants/Routes';
import { STATUSES } from '@/constants/Statuses';
import { Signal } from '@/reactive/Signal';
import { eventBus } from '@/helpers/EventBus';
import { router } from '@/helpers/Router';
import { user } from '@/store/User';
import { ApiError, ApiSuccess } from '@/api/ApiResponse';
import type {
  ProfileData,
  ProfileField,
  ProfileFieldErrors,
  ProfileFormValues,
  UpdateProfileData,
} from '@/api/profile/Profile.types';
import {
  normalizeProfileBackendReason,
  validateProfileField,
  validateProfileTab,
} from './Profile.helpers';

export const VALID_TABS: ProfileTab[] = ['public', 'security', 'email', 'phone', 'password'];

/**
 * Модель страницы профиля.
 */
export class ProfilePageModel {
  readonly activeTab = new Signal<ProfileTab>(this.getTabFromUrl());
  readonly profile = new Signal<ProfileData | null>(null);
  readonly errorMessage = new Signal<string | null>(null);
  readonly fieldErrors = new Signal<ProfileFieldErrors>({});
  readonly formError = new Signal<string | null>(null);
  readonly isSubmitting = new Signal<boolean>(false);

  formValues: ProfileFormValues = {
    first_name: '',
    last_name: '',
    nickname: '',
    phone: '',
    email: '',
    old_password: '',
    new_password: '',
    confirm_password: '',
  };

  private readonly touchedFields = new Set<ProfileField>();

  private readonly offSubmit: () => void;
  private readonly offFieldChange: () => void;
  private readonly offFieldBlur: () => void;

  constructor() {
    this.offSubmit = eventBus.on('profile:submit', () => {
      void this.submit();
    });

    this.offFieldChange = eventBus.on('profile:field-change', ({ field, value }) => {
      this.setField(field, value);
    });

    this.offFieldBlur = eventBus.on('profile:field-blur', ({ field }) => {
      this.touchedFields.add(field);
      this.updateSingleFieldError(field);
    });
  }

  destroy(): void {
    this.offSubmit();
    this.offFieldChange();
    this.offFieldBlur();
  }

  getTabFromUrl(): ProfileTab {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const tab = segments[1] as ProfileTab | undefined;

    return tab && VALID_TABS.includes(tab) ? tab : 'security';
  }

  /**
   * Переключает активную вкладку и сбрасывает временные состояния формы.
   */
  syncTabWithUrl(): void {
    const nextTab = this.getTabFromUrl();
    this.touchedFields.clear();
    this.fieldErrors.value = {};
    this.formError.value = null;
    this.syncFormValuesWithProfile(this.profile.value);
    this.activeTab.value = nextTab;
  }

  async loadProfile(): Promise<void> {
    this.activeTab.value = this.getTabFromUrl();
    this.errorMessage.value = null;

    const res = await ProfileApi.getProfile();
    if (res instanceof ApiSuccess) {
      this.syncFormValuesWithProfile(res.data);
      this.profile.value = res.data;
    } else {
      this.errorMessage.value = DEFAULT_ERROR_MESSAGE;
    }
  }

  private syncFormValuesWithProfile(data: ProfileData | null = this.profile.value): void {
    this.formValues = {
      first_name: data?.first_name ?? '',
      last_name: data?.last_name ?? '',
      nickname: data?.nickname ?? '',
      phone: data?.phone_number ?? '',
      email: data?.email ?? '',
      old_password: '',
      new_password: '',
      confirm_password: '',
    };
  }

  private setField(field: ProfileField, value: string): void {
    this.formValues[field] = value;
    this.formError.value = null;

    if (this.touchedFields.has(field)) {
      this.updateSingleFieldError(field);
    } else if (field in this.fieldErrors.value) {
      const next = { ...this.fieldErrors.value };
      delete next[field];
      this.fieldErrors.value = next;
    }

    if (field === 'new_password' && this.touchedFields.has('confirm_password')) {
      this.updateSingleFieldError('confirm_password');
    }
  }

  private updateSingleFieldError(field: ProfileField): void {
    const error = validateProfileField(field, this.formValues[field], this.formValues);
    const next = { ...this.fieldErrors.value };

    if (error) {
      next[field] = error;
    } else {
      delete next[field];
    }

    this.fieldErrors.value = next;
  }

  private async submit(): Promise<void> {
    const tab = this.activeTab.value;
    if (this.isSubmitting.value || tab === 'security') return;

    this.formError.value = null;

    const { isValid, fieldErrors } = validateProfileTab(tab, this.formValues);
    if (!isValid) {
      (Object.keys(fieldErrors) as ProfileField[]).forEach((f) => this.touchedFields.add(f));
      this.fieldErrors.value = fieldErrors;
      return;
    }

    this.fieldErrors.value = {};
    this.isSubmitting.value = true;

    if (tab === 'password') {
      const result = await ProfileApi.updatePassword({
        old_password: this.formValues.old_password,
        new_password: this.formValues.new_password,
      });

      this.isSubmitting.value = false;

      if (result instanceof ApiSuccess) {
        this.touchedFields.clear();
        this.syncFormValuesWithProfile(this.profile.value);
        void router.goTo(ROUTES.PROFILE_SECURITY);
        return;
      }

      this.handleApiError(result);
      return;
    }

    const payload = this.buildUpdatePayload(tab);
    const result = await ProfileApi.updateProfile(payload);

    this.isSubmitting.value = false;

    if (result instanceof ApiSuccess) {
      this.touchedFields.clear();
      const updatedProfile: ProfileData = {
        ...this.profile.value,
        ...result.data,
        ...(payload.phone_number !== undefined ? { phone_number: payload.phone_number } : {}),
      };

      this.syncFormValuesWithProfile(updatedProfile);
      this.profile.value = updatedProfile;

      if (tab !== 'public') {
        void router.goTo(ROUTES.PROFILE_SECURITY);
      } else {
        eventBus.emit('snackbar:show', { text: 'Профиль обновлён', type: 'success' });
      }

      void user.updateCurrentUser();
      return;
    }

    this.handleApiError(result);
  }

  private buildUpdatePayload(tab: Exclude<ProfileTab, 'security' | 'password'>): UpdateProfileData {
    switch (tab) {
      case 'public':
        return {
          first_name: this.formValues.first_name.trim(),
          last_name: this.formValues.last_name.trim(),
          nickname: this.formValues.nickname.trim(),
        };
      case 'email':
        return {
          email: this.formValues.email.trim().toLowerCase(),
        };
      case 'phone':
        return {
          phone_number: this.formValues.phone.trim(),
        };
    }
  }

  private handleApiError(error: ApiError): void {
    const nextErrors: ProfileFieldErrors = {};

    if (Array.isArray(error.details)) {
      for (const detail of error.details) {
        let mappedField: ProfileField;

        switch (detail.field) {
          case 'phone_number':
            mappedField = 'phone';
            break;
          case 'password':
            mappedField = 'new_password';
            break;
          default:
            mappedField = detail.field as ProfileField;
            break;
        }

        if (mappedField in this.formValues && !nextErrors[mappedField]) {
          nextErrors[mappedField] = normalizeProfileBackendReason(mappedField, detail.reason);
        }
      }
    }

    if (error.status === STATUSES.CONFLICT) {
      const upperMessage = (error.message || '').toUpperCase();
      const conflictFields: ProfileField[] = ['email', 'nickname'];

      conflictFields.forEach((field) => {
        const token = field.toUpperCase();
        if (error.code === `${token}_TAKEN` || upperMessage.includes(token)) {
          nextErrors[field] = `${field}_already_exists`;
        }
      });

      if (this.activeTab.value === 'phone' || upperMessage.includes('PHONE')) {
        nextErrors.phone = 'phone_already_exists';
      }
    }

    if (
      this.activeTab.value === 'password' &&
      (error.code === 'INVALID_CREDENTIALS' || error.status === STATUSES.BAD_REQUEST) &&
      Object.keys(nextErrors).length === 0
    ) {
      nextErrors.old_password = 'invalid_old_password';
    }

    if (Object.keys(nextErrors).length > 0) {
      this.fieldErrors.value = nextErrors;
      return;
    }

    this.formError.value =
      error.status === STATUSES.BAD_REQUEST
        ? 'Проверьте правильность заполнения полей'
        : error.message || DEFAULT_ERROR_MESSAGE;
  }
}
