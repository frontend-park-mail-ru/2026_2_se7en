import { Button } from '@/components/core/Button.ts';
import type { PublicProfileView } from '@/components/profile/PublicProfileModal.ts';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';

export const SEARCH_SECTIONS = ['users', 'contacts', 'chats', 'messages'] as const;
export type SearchSection = (typeof SEARCH_SECTIONS)[number];

export interface SidebarSearchItem {
  id: string;
  title: string;
  description?: string;
  chatId?: string;
  profile?: PublicProfileView;
}

export interface SidebarSearchSection {
  items: SidebarSearchItem[];
  loading: boolean;
  error: boolean;
  hasMore: boolean;
}

export type SidebarSearchResults = Record<SearchSection, SidebarSearchSection>;

const sectionTitles: Record<SearchSection, string> = {
  users: 'Пользователи',
  contacts: 'Контакты',
  chats: 'Чаты',
  messages: 'Сообщения',
};

/** Отображает результаты поиска и состояние загрузки каждой секции боковой панели. */
export function renderSidebarSearch(results: SidebarSearchResults): string {
  return SEARCH_SECTIONS.map((key) => {
    const section = results[key];
    const items = section.items
      .map((item) => {
        const text = `<span class="chat-item__body">
        <span class="chat-item__name">${escapeHtml(item.title)}</span>
        ${item.description ? `<span class="chat-item__message">${escapeHtml(item.description)}</span>` : ''}
      </span>`;

        if (item.profile) {
          return `<div class="chat-item chat-item_search-user">
          ${text}
          <div class="chat-panel__search-actions">
            ${Button({
              text: 'Написать',
              mode: 'unstyled',
              className: 'chat-panel__search-more',
              attrs: { 'data-search-write': item.id },
            })}
            ${Button({
              text: item.profile.isContact
                ? 'Уже в контактах'
                : item.profile.isAddingContact
                  ? 'Добавляем…'
                  : 'Добавить в контакты',
              mode: 'unstyled',
              className: 'chat-panel__search-more',
              disabled: item.profile.isContact || item.profile.isAddingContact,
              attrs: { 'data-search-add-contact': item.id },
            })}
          </div>
        </div>`;
        }

        return Button({
          text,
          mode: 'unstyled',
          className: 'chat-item',
          attrs: {
            'data-search-section': key,
            'data-search-result': item.id,
            'data-search-chat': item.chatId ?? '',
          },
        });
      })
      .join('');
    const status = section.loading
      ? 'Ищем…'
      : section.error
        ? 'Не удалось загрузить результаты'
        : 'Ничего не найдено';
    const showStatus = section.loading || section.error || !section.items.length;

    return `<section class="chat-panel__search-section" aria-label="${sectionTitles[key]}">
      <h3>${sectionTitles[key]}</h3>
      ${items}
      ${showStatus ? `<p role="status">${status}</p>` : ''}
      ${
        !section.loading && (section.error || section.hasMore)
          ? Button({
              text: section.error ? 'Повторить' : 'Загрузить ещё',
              mode: 'unstyled',
              className: 'chat-panel__search-more',
              attrs: { 'data-search-more': key },
            })
          : ''
      }
    </section>`;
  }).join('');
}
