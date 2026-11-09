import './ContactPicker.scss';
import { Button } from '@/components/core/Button.ts';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';
import type { ContactPickerView, ContactPreview } from './chat.types.ts';

/** Отображает список контактов для нового диалога. */
export function renderContactPicker(
  contacts: ContactPreview[],
  view: ContactPickerView = {},
): string {
  return `
    <section class="contact-picker" aria-label="Выбор контакта для диалога">
      <header class="contact-picker__header">
        ${Button({ text: '<img src="/design-assets/63b18.svg" alt="" width="20" height="20">', mode: 'unstyled', ariaLabel: 'Вернуться к чатам', attrs: { 'data-contact-back': '' } })}
        <h2>Новый диалог</h2>
      </header>
      <div class="contact-picker__list" aria-busy="${Boolean(view.loading)}">
        ${
          view.loading
            ? '<p class="contact-picker__empty" role="status">Загрузка контактов…</p>'
            : view.error
              ? `<div class="contact-picker__empty" role="alert"><p>${escapeHtml(view.error)}</p>${Button({ text: 'Повторить', mode: 'unstyled', attrs: { 'data-contacts-retry': '' } })}</div>`
              : contacts.length
                ? contacts
                    .map(
                      (contact) => `
          ${Button({
            mode: 'unstyled',
            className: 'contact-picker__item',
            attrs: { 'data-contact-id': contact.id },
            text: `
            <span class="contact-picker__avatar">
              ${contact.avatarUrl ? `<img class="contact-picker__avatar-image" src="${escapeHtml(contact.avatarUrl)}" alt="">` : escapeHtml(contact.initials)}
              ${contact.online ? '<span class="contact-picker__online"></span>' : ''}
            </span>
            <span class="contact-picker__text">
              <strong>${escapeHtml(contact.name)}</strong>
              <small>${escapeHtml(contact.nickname)}</small>
            </span>
          `,
          })}
        `,
                    )
                    .join('')
                : '<p class="contact-picker__empty">Контакты пока недоступны</p>'
        }
      </div>
    </section>
  `;
}
