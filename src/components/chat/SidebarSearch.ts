import { Button } from '@/components/core/Button.ts';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';

export const SEARCH_SECTIONS = ['contacts', 'chats', 'messages'] as const;
export type SearchSection = (typeof SEARCH_SECTIONS)[number];

export interface SidebarSearchItem {
  id: string;
  title: string;
  description?: string;
  chatId?: string;
}

export interface SidebarSearchSection {
  items: SidebarSearchItem[];
  loading: boolean;
  error: boolean;
  hasMore: boolean;
}

export type SidebarSearchResults = Record<SearchSection, SidebarSearchSection>;

const sectionTitles: Record<SearchSection, string> = {
  contacts: 'Контакты',
  chats: 'Чаты',
  messages: 'Сообщения',
};

export function renderSidebarSearch(results: SidebarSearchResults): string {
  return SEARCH_SECTIONS.map((key) => {
    const section = results[key];
    const items = section.items
      .map((item) =>
        Button({
          text: `<span class="chat-item__body">
        <span class="chat-item__name">${escapeHtml(item.title)}</span>
        ${item.description ? `<span class="chat-item__message">${escapeHtml(item.description)}</span>` : ''}
      </span>`,
          mode: 'unstyled',
          className: 'chat-item',
          attrs: {
            'data-search-section': key,
            'data-search-result': item.id,
            'data-search-chat': item.chatId ?? '',
          },
        }),
      )
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
