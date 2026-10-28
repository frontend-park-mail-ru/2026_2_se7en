import './Header.scss';

/**
 * Генерирует HTML-разметку для шапки страницы (Header).
 */
export function Header({ title }: { title: string }): string {
  return `
    <header class="app-header">
      <h1 class="app-header__title">${title}</h1>
    </header>
  `;
}
