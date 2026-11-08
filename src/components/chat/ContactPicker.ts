import './ContactPicker.scss';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';

export interface ContactPreview {
  id: string;
  name: string;
  nickname: string;
  initials: string;
  avatarUrl?: string;
  online: boolean;
}

export interface ContactPickerView {
  loading?: boolean;
  error?: string;
  query?: string;
}

export function renderContactPicker(
  contacts: ContactPreview[],
  view: ContactPickerView = {},
): string {
  return `
    <section class="contact-picker" aria-label="Выбор контакта для диалога">
      <header class="contact-picker__header">
        <button type="button" data-contact-back aria-label="Вернуться к чатам">
          <img src="/design-assets/63b18.svg" alt="" width="20" height="20">
        </button>
        <h2>Новый диалог</h2>
      </header>
      <label class="contact-picker__search">
        <img src="/design-assets/9e868.svg" alt="" width="17" height="17">
        <input type="search" name="contact-search" value="${escapeHtml(view.query)}" placeholder="Поиск по имени или никнейму" aria-label="Поиск контакта" data-contact-search>
      </label>
      <div class="contact-picker__list" aria-busy="${Boolean(view.loading)}">
        ${
          view.loading
            ? '<p class="contact-picker__empty" role="status">Загрузка контактов…</p>'
            : view.error
              ? `<div class="contact-picker__empty" role="alert"><p>${escapeHtml(view.error)}</p><button type="button" data-contacts-retry>Повторить</button></div>`
              : contacts.length
                ? contacts
                    .map(
                      (contact) => `
          <button type="button" class="contact-picker__item" data-contact-id="${escapeHtml(contact.id)}">
            <span class="contact-picker__avatar">
              ${contact.avatarUrl ? `<img class="contact-picker__avatar-image" src="${escapeHtml(contact.avatarUrl)}" alt="">` : escapeHtml(contact.initials)}
              ${contact.online ? '<span class="contact-picker__online"></span>' : ''}
            </span>
            <span class="contact-picker__text">
              <strong>${escapeHtml(contact.name)}</strong>
              <small>${escapeHtml(contact.nickname)}</small>
            </span>
          </button>
        `,
                    )
                    .join('')
                : '<p class="contact-picker__empty">Контакты пока недоступны</p>'
        }
      </div>
    </section>
  `;
}
