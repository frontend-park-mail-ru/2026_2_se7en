import './AuthLayout.scss';

export interface AuthLayoutParams {
  title: string;
  subtitle: string;
  topBar?: string;
  children: string;
}

/**
 * Генерирует split-screen разметку для страниц авторизации.
 */
export function AuthLayout({ title, subtitle, topBar = '', children }: AuthLayoutParams): string {
  return `
  <div class="auth">
    <div class="auth__aside">
      <div class="auth__brand">
        <img src="/pictures/icon.png" alt="Логотип" class="auth__brand-logo" />
        <span class="auth__brand-name">Связь</span>
      </div>

      <div class="auth__pitch">
        <div class="auth__pitch-inner">
          <h1 class="auth__title">${title}</h1>
          <p class="auth__subtitle">${subtitle}</p>
        </div>
      </div>
    </div>

    <div class="auth__main">
      ${topBar}

      <div class="auth__content">
        <div class="auth__form-box">
          ${children}
        </div>
      </div>
    </div>
  </div>
  `;
}
