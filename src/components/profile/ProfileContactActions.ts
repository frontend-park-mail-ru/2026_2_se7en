import './ProfileContactActions.scss';
import type { ApiResult } from '@/api/ApiResponse';
import { Button } from '@/components/core/Button';
import { CONTACT_PSEUDONYM_MAX_BYTES } from '@/api/contacts/contacts.constants';
import { Input } from '@/components/core/Input';
import { escapeHtml } from '@/helpers/EscapeHtml';
import { validateForbiddenChars } from '@/helpers/Validation';

export interface ProfileContactActionsOptions {
  isOwnProfile: boolean;
  isContact: boolean;
  pseudonym?: string | null;
  displayName: string;
  addContact: (pseudonym: string) => Promise<ApiResult<unknown>>;
  removeContact: () => Promise<ApiResult<unknown>>;
}

export class ProfileContactActions {
  private container: HTMLElement | null = null;
  private isBusy = false;
  private isDestroyed = false;
  private readonly events = new AbortController();

  constructor(private readonly options: ProfileContactActionsOptions) {}

  mount(container: HTMLElement): void {
    this.container = container;
    if (this.options.isOwnProfile) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <p class="profile-contact-actions__pseudonym" data-contact-pseudonym hidden></p>
      ${Button({ text: '', mode: 'secondary', attrs: { 'data-contact-action': '' } })}
      <p class="profile-contact-actions__status" role="status" data-contact-status></p>
      <dialog class="profile-contact-dialog" aria-labelledby="contact-dialog-title" aria-describedby="contact-dialog-description">
        <form class="profile-contact-dialog__form" novalidate>
          <h2 id="contact-dialog-title">Добавить в контакты</h2>
          <p id="contact-dialog-description">Выберите, как ${escapeHtml(this.options.displayName)} будет отображаться в вашем списке контактов.</p>
          <label for="contact-pseudonym">Псевдоним</label>
          ${Input({
            id: 'contact-pseudonym',
            name: 'pseudonym',
            placeholder: 'Введите псевдоним',
            attrs: {
              autocomplete: 'off',
              required: '',
              'aria-describedby': 'contact-pseudonym-error',
            },
          })}
          <p id="contact-pseudonym-error" class="profile-contact-dialog__error" role="alert"></p>
          <div class="profile-contact-dialog__actions">
            ${Button({ text: 'Отмена', mode: 'secondary', attrs: { 'data-contact-cancel': '' } })}
            ${Button({ text: 'Добавить', type: 'submit' })}
          </div>
        </form>
      </dialog>
    `;

    const dialog = container.querySelector('dialog')!;
    const input = container.querySelector('input')!;
    const form = container.querySelector('form')!;
    const signal = this.events.signal;

    container.querySelector('[data-contact-action]')!.addEventListener(
      'click',
      () => {
        if (this.isBusy) return;
        this.setStatus('');
        if (this.options.isContact) {
          void this.remove();
        } else {
          input.value = this.options.displayName;
          this.setError('');
          dialog.showModal();
          input.focus();
          input.select();
        }
      },
      { signal },
    );

    container.querySelector('[data-contact-cancel]')!.addEventListener(
      'click',
      () => {
        if (!this.isBusy) dialog.close();
      },
      { signal },
    );

    dialog.addEventListener(
      'cancel',
      (event) => {
        if (this.isBusy) event.preventDefault();
      },
      { signal },
    );

    dialog.addEventListener(
      'click',
      (event) => {
        if (event.target !== dialog || this.isBusy) return;
        const rect = dialog.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          dialog.close();
      },
      { signal },
    );

    input.addEventListener('input', () => this.setError(''), { signal });
    form.addEventListener(
      'submit',
      (event) => {
        event.preventDefault();
        void this.add(input.value.trim());
      },
      { signal },
    );

    this.updateButtons();
  }

  destroy(): void {
    this.isDestroyed = true;
    this.events.abort();
    this.container?.querySelector('dialog')?.close();
    this.container = null;
  }

  private async add(pseudonym: string): Promise<void> {
    if (this.isBusy) return;
    const error = !pseudonym
      ? 'Введите псевдоним'
      : new TextEncoder().encode(pseudonym).length > CONTACT_PSEUDONYM_MAX_BYTES
        ? 'Псевдоним слишком длинный'
        : validateForbiddenChars(pseudonym);
    if (error) {
      this.setError(error);
      this.container?.querySelector('input')?.focus();
      return;
    }

    this.isBusy = true;
    this.updateButtons();
    try {
      const result = await this.options.addContact(pseudonym);
      if (this.isDestroyed) return;
      if (result.success === true) {
        this.options.isContact = true;
        this.options.pseudonym = pseudonym;
        this.container?.querySelector('dialog')?.close();
        this.setStatus('Контакт добавлен');
      } else {
        this.setError(result.message || 'Не удалось добавить контакт. Попробуйте ещё раз.');
      }
    } catch {
      if (!this.isDestroyed) this.setError('Не удалось добавить контакт. Попробуйте ещё раз.');
    } finally {
      this.isBusy = false;
      if (!this.isDestroyed) this.updateButtons();
    }
  }

  private async remove(): Promise<void> {
    this.isBusy = true;
    this.updateButtons();
    try {
      const result = await this.options.removeContact();
      if (this.isDestroyed) return;
      if (result.success === true) {
        this.options.isContact = false;
        this.options.pseudonym = null;
        this.setStatus('Контакт удалён');
      } else {
        this.setStatus(result.message || 'Не удалось удалить контакт. Попробуйте ещё раз.');
      }
    } catch {
      if (!this.isDestroyed) this.setStatus('Не удалось удалить контакт. Попробуйте ещё раз.');
    } finally {
      this.isBusy = false;
      if (!this.isDestroyed) this.updateButtons();
    }
  }

  private setError(message: string): void {
    const error = this.container?.querySelector('[role="alert"]');
    if (error) error.textContent = message;
    this.container?.querySelector('input')?.setAttribute('aria-invalid', String(Boolean(message)));
  }

  private setStatus(message: string): void {
    const status = this.container?.querySelector('[data-contact-status]');
    if (status) status.textContent = message;
  }

  private updateButtons(): void {
    const pseudonym = this.container?.querySelector<HTMLElement>('[data-contact-pseudonym]');
    if (pseudonym) {
      const value = this.options.isContact ? this.options.pseudonym?.trim() : '';
      pseudonym.hidden = !value;
      pseudonym.textContent = value ? `В ваших контактах: ${value}` : '';
    }
    const action = this.container?.querySelector<HTMLButtonElement>('[data-contact-action]');
    if (action) {
      action.disabled = this.isBusy;
      action.textContent = this.isBusy
        ? 'Подождите…'
        : this.options.isContact
          ? 'Удалить из контактов'
          : 'Добавить в контакты';
      action.classList.toggle('profile-contact-actions__remove', this.options.isContact);
    }
    this.container
      ?.querySelectorAll<HTMLInputElement | HTMLButtonElement>('dialog input, dialog button')
      .forEach((control) => {
        control.disabled = this.isBusy;
      });
    const submit = this.container?.querySelector<HTMLButtonElement>('[type="submit"]');
    if (submit) submit.textContent = this.isBusy ? 'Добавление…' : 'Добавить';
  }
}
