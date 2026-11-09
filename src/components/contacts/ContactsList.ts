import './ContactsList.scss';
import { Button } from '@/components/core/Button.ts';
import { DEMO_PROFILES } from '@/api/contacts/contacts.mock';
import type { DisplayContact } from '@/api/contacts/contacts.types.ts';
import { Input } from '@/components/core/Input.ts';
import { SearchIcon } from '@/components/core/Icons.ts';
import { USING_MOCK } from '@/api/api.constants';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';
import { getUserProfileHref } from '@/constants/Routes';

/**
 * Подпись количества контактов.
 * */
function getContactCount(count: number): string {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${count} контактов`;
  if (lastDigit === 1) return `${count} контакт`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${count} контакта`;
  return `${count} контактов`;
}

/**
 * Компонент списка контактов.
 */
export class ContactsList {
  /**
   * Рендерит элемент списка контактов.
   * */
  private renderContact(contact: DisplayContact, activeContactId: string | null): string {
    const isActive = contact.id === activeContactId;

    return Button({
      text: `
        <span class="contact-item__avatar-box">
          <span class="contact-item__avatar">${escapeHtml(contact.initials)}</span>
          ${contact.isOnline ? '<span class="contact-item__online"></span>' : ''}
        </span>
        <span class="contact-item__details">
          <span class="contact-item__name">${escapeHtml(contact.name)}</span>
          <span class="contact-item__status${contact.isOnline ? ' contact-item__status_online' : ''}">
            ${contact.isOnline ? 'в сети' : 'был недавно'}
          </span>
        </span>
      `,
      mode: 'ghost',
      className: `contact-item${isActive ? ' contact-item_active' : ''}`,
      attrs: {
        'data-contact-id': contact.id,
        'aria-pressed': String(isActive),
      },
    });
  }

  /**
   * Рендерит список контактов
   * */
  renderItems(
    contacts: DisplayContact[],
    activeContactId: string | null,
    isLoading: boolean,
    hasError: boolean,
    totalCount: number,
  ): string {
    if (isLoading) {
      return '<p class="contacts-list__message">Загружаем контакты…</p>';
    }

    if (hasError) {
      return `
        <div class="contacts-list__message">
          <p>Не удалось загрузить контакты.</p>
          ${Button({ id: 'contacts-retry', text: 'Попробовать ещё раз', mode: 'ghost' })}
        </div>
      `;
    }

    if (totalCount === 0) {
      return `
        <div class="contacts-list__empty">
          <h3>Пока нет контактов</h3>
          <p>Найдите человека по имени или никнейму, чтобы начать общение.</p>
        </div>
      `;
    }

    if (contacts.length === 0) {
      return '<p class="contacts-list__message">Контакты не найдены</p>';
    }

    return contacts.map((contact) => this.renderContact(contact, activeContactId)).join('');
  }

  /**
   * Рендерит панель контактов целиком.
   * */
  render(
    contacts: DisplayContact[],
    activeContactId: string | null,
    isLoading: boolean,
    hasError: boolean,
    searchQuery: string,
    totalCount: number,
  ): string {
    const search = Input({
      id: 'contacts-search',
      placeholder: 'Поиск по имени или никнейму',
      value: searchQuery,
      icon: SearchIcon,
    });

    const showSearch = !isLoading && !hasError && totalCount > 0;

    return `
      <section class="contacts-list" aria-label="Список контактов">
        <header class="contacts-list__header">
          <h2 class="contacts-list__title">Контакты</h2>
        </header>
        ${
          showSearch
            ? `
              <div class="contacts-list__search">${search}</div>
              <p class="contacts-list__count">${getContactCount(totalCount)}</p>
            `
            : ''
        }
        <div class="contacts-list__items" data-contact-list>
          ${this.renderItems(contacts, activeContactId, isLoading, hasError, totalCount)}
        </div>
        ${
          USING_MOCK.CONTACTS
            ? `
          <div class="contacts-list__demo">
            <h3>Профили пользователей</h3>
            <p>Демонстрационные данные</p>
            ${DEMO_PROFILES.map((profile) => `<a href="${getUserProfileHref(profile.id)}">${escapeHtml(`${profile.first_name} ${profile.last_name || ''}`.trim())} →</a>`).join('')}
          </div>
        `
            : ''
        }
      </section>
    `;
  }
}
