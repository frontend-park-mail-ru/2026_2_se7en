import './ContactsList.scss';
import { Button } from '@/components/core/Button.ts';
import type { DisplayContact } from '@/api/contacts/contacts.types.ts';
import { PanelSearch } from '@/components/core/PanelSearch.ts';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';

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
  private renderContact(
    contact: DisplayContact,
    activeContactId: string | null,
    openMenuId: string | null,
    pendingDeleteId: string | null,
  ): string {
    const isActive = contact.id === activeContactId;
    const isMenuOpen = contact.id === openMenuId;

    return `
      <div class="contact-item-row${isActive ? ' contact-item-row_active' : ''}" data-contact-row="${escapeHtml(contact.id)}">
        ${Button({
          text: `
            <span class="contact-item__avatar-box">
              <span class="contact-item__avatar">${contact.avatarUrl ? `<img src="${escapeHtml(contact.avatarUrl)}" alt="">` : escapeHtml(contact.initials)}</span>
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
        })}
        ${Button({
          text: '⋯',
          mode: 'unstyled',
          className: `contact-item__menu-toggle${isMenuOpen ? ' contact-item__menu-toggle_active' : ''}`,
          ariaLabel: `Меню контакта ${contact.name}`,
          title: 'Действия с контактом',
          attrs: {
            'aria-haspopup': 'menu',
            'aria-expanded': String(isMenuOpen),
            'data-contact-menu-toggle': contact.id,
          },
        })}
        ${
          isMenuOpen
            ? `<div class="contact-item__menu" role="menu">
                ${Button({
                  text: pendingDeleteId === contact.id ? 'Удаляем…' : 'Удалить контакт',
                  mode: 'unstyled',
                  className: 'contact-item__menu-danger',
                  disabled: pendingDeleteId === contact.id,
                  attrs: { role: 'menuitem', 'data-contact-delete': contact.id },
                })}
              </div>`
            : ''
        }
      </div>
    `;
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
    query = '',
    openMenuId: string | null = null,
    pendingDeleteId: string | null = null,
  ): string {
    if (isLoading && contacts.length === 0) {
      return '';
    }

    if (hasError) {
      return `
        <div class="contacts-list__message">
          <p>Не удалось загрузить контакты.</p>
          ${Button({ id: 'contacts-retry', text: 'Попробовать ещё раз', mode: 'ghost' })}
        </div>
      `;
    }

    if (totalCount === 0 && !query.trim()) {
      return `
        <div class="contacts-list__empty">
          <h3>Пока нет контактов</h3>
          <p>Добавьте пользователя в контакты, чтобы начать общение.</p>
        </div>
      `;
    }

    if (contacts.length === 0) {
      return '<p class="contacts-list__message">Контакты не найдены</p>';
    }

    return contacts
      .map((contact) => this.renderContact(contact, activeContactId, openMenuId, pendingDeleteId))
      .join('');
  }

  /**
   * Рендерит панель контактов целиком.
   * */
  render(
    contacts: DisplayContact[],
    activeContactId: string | null,
    isLoading: boolean,
    hasError: boolean,
    totalCount: number,
    query = '',
    openMenuId: string | null = null,
    pendingDeleteId: string | null = null,
  ): string {
    return `
      <section class="contacts-list" aria-label="Список контактов">
        <header class="contacts-list__header">
          <div>
            <h2 class="contacts-list__title">Контакты</h2>
            <p class="contacts-list__status">В сети</p>
          </div>
        </header>
        <div class="contacts-list__search">${PanelSearch({ label: 'Поиск контактов', placeholder: 'Поиск контактов', value: query, name: 'contact-search' })}</div>
        ${!isLoading && !hasError && totalCount > 0 ? `<p class="contacts-list__count">${getContactCount(totalCount)}</p>` : ''}
        <div class="contacts-list__items" data-contact-list>
          ${this.renderItems(contacts, activeContactId, isLoading, hasError, totalCount, query, openMenuId, pendingDeleteId)}
        </div>
      </section>
    `;
  }
}
