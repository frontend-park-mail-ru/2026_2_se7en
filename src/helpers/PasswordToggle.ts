/**
 * Переключает видимость пароля в связанном поле.
 *
 * Ищет `<input id="...">` по `data-toggle-password` на кнопке, меняет `type`
 * и прячет/показывает иконки `[data-eye]`.
 *
 * Используется на страницах login, register и profile.
 */
export function togglePasswordVisibility(button: HTMLElement): void {
  const inputId = button.dataset.togglePassword;
  if (!inputId) return;

  const input = document.getElementById(inputId);
  if (!(input instanceof HTMLInputElement)) return;

  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';

  button.setAttribute('aria-label', show ? 'Скрыть пароль' : 'Показать пароль');
  button.setAttribute('aria-pressed', String(show));
  button.querySelector('[data-eye="open"]')?.classList.toggle('is-hidden', show);
  button.querySelector('[data-eye="closed"]')?.classList.toggle('is-hidden', !show);
}

/**
 * Навешивает обработчик клика на все `[data-toggle-password]` внутри контейнера.
 */
export function bindPasswordToggles(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('[data-toggle-password]').forEach((button) => {
    button.addEventListener('click', () => togglePasswordVisibility(button));
  });
}
