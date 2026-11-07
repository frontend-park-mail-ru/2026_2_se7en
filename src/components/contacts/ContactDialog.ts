import './ContactDialog.scss';
import type { DisplayContact } from '@/api/contacts/contacts.types.ts';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';

/**
 * Компонент диалога с контактом.
 * */
export class ContactDialog {
  render(activeContact: DisplayContact | null, hasContacts: boolean): string {
    return `
      <section class="contact-dialog" aria-label="Диалог с контактом">
        ${
          activeContact
            ? `
              <header class="contact-dialog__header">
                <span class="contact-dialog__avatar-box">
                  <span class="contact-dialog__avatar">${escapeHtml(activeContact.initials)}</span>
                  ${activeContact.isOnline ? '<span class="contact-dialog__online"></span>' : ''}
                </span>
                <div class="contact-dialog__identity">
                  <h2 class="contact-dialog__name">${escapeHtml(activeContact.name)}</h2>
                  <p class="contact-dialog__status${activeContact.isOnline ? ' contact-dialog__status_online' : ''}">
                    ${activeContact.isOnline ? 'в сети' : 'был недавно'}
                  </p>
                </div>
              </header>
              <div class="contact-dialog__body" aria-live="polite">
                <p class="contact-dialog__text">Заглушка переписки</p>
              </div>
            `
            : `
              <div class="contact-dialog__placeholder">
                <h2 class="contact-dialog__title">Общение начинается с контакта</h2>
                <p class="contact-dialog__text">
                  ${
                    hasContacts
                      ? 'Выберите контакт чтобы показать диалог с ним.'
                      : 'Добавить пользователя в контакты можно на странице его профиля'
                  }
                </p>
              </div>
            `
        }
      </section>
    `;
  }
}
