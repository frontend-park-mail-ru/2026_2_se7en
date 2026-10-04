import { AuthLayout } from '../../components/Auth/AuthLayout.js';
import { AuthForm } from '../../components/Auth/AuthForm.js';
import { AuthApi } from '../../api/auth/AuthApi.js';
import { validateEmail, validatePassword } from '../../helpers/validation.js';
import { Page } from '../Page.js';
import { ROUTES } from '../../constants/Routes.js';
import { LOGIN_FORM_ID, LOGIN_SUBMIT_ID } from '../../constants/Login.js';
import { ERROR_CODES, ERROR_HINTS, ERROR_MESSAGES } from '../../api/error.constants.js';
import { showPage } from '../../router.js';
import { ChatsPage } from '../ChatsPage/ChatsPage.js';

/**
 * Страница авторизации.
 * Отвечает за рендеринг формы, клиентскую валидацию и отправку данных на сервер.
 */
export class LoginPage extends Page {
  static route = ROUTES.LOGIN;

  constructor() {
    super();
    this.fieldErrors = {};
    this.generalError = '';
    this.generalErrorHint = '';
    this.loading = false;
    this.values = { email: '', password: '' };
  }

  /**
   * Генерирует HTML-разметку страницы: лейаут с формой логина.
   *
   * @returns {Promise<string>} HTML-строка с разметкой страницы.
   */
  async render() {
    const authForm = await AuthForm({
      formId: LOGIN_FORM_ID,
      submitId: LOGIN_SUBMIT_ID,
      title: 'С возвращением',
      subtitle: 'Введите адрес электронной почты, чтобы продолжить общение в Связь.',
      fields: this.buildFields(),
      submitText: 'Войти',
      footer: `Впервые здесь? <a href="${ROUTES.REGISTER}" class="font-semibold text-gray-900 hover:underline">Создать аккаунт</a>`,
      generalError: this.generalError,
      generalErrorHint: this.generalErrorHint,
      loading: this.loading,
    });

    return AuthLayout({
      title: 'Общение, которое<br />всегда рядом',
      subtitle: 'Продолжайте разговоры на большом экране',
      children: authForm,
    });
  }

  /**
   * Собирает параметры полей формы на основе текущих значений и ошибок.
   *
   * @returns {Array<Object>} Массив параметров для компонента Field.
   */
  buildFields() {
    return [
      {
        id: 'email',
        name: 'email',
        type: 'email',
        label: 'Электронная почта',
        placeholder: 'name@example.com',
        value: this.values.email,
        error: this.fieldErrors.email || '',
      },
      {
        id: 'password',
        name: 'password',
        type: 'password',
        label: 'Пароль',
        placeholder: 'password',
        value: this.values.password,
        error: this.fieldErrors.password || '',
      },
    ];
  }

  /**
   * Монтирует страницу: вставляет HTML в контейнер и навешивает обработчики.
   */
  /**
   * Перерисовывает страницу с сохранением текущего состояния.
   */
  async rerender() {
    this.container.innerHTML = await this.render();
    this.bindEvents();
  }

  /**
   * Навешивает обработчики на форму и кнопки показа пароля.
   */
  bindEvents() {
    const form = document.getElementById(LOGIN_FORM_ID);
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit();
    });

    this.container.querySelectorAll('[data-toggle-password]').forEach((btn) => {
      btn.addEventListener('click', () => this.togglePassword(btn));
    });
  }

  /**
   * Переключает видимость пароля и меняет иконку глаза.
   *
   * @param {HTMLElement} btn - Кнопка переключения.
   */
  togglePassword(btn) {
    const input = document.getElementById(btn.dataset.togglePassword);
    if (!input) return;

    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';

    btn.querySelector('[data-eye="open"]')?.classList.toggle('hidden', show);
    btn.querySelector('[data-eye="closed"]')?.classList.toggle('hidden', !show);
  }

  /**
   * Обрабатывает отправку формы: валидирует поля, отправляет запрос на сервер,
   * показывает ошибки или делает редирект при успехе.
   *
   * @async
   */
  async submit() {
    if (this.loading) return;

    const emailEl = document.getElementById('email');
    const passwordEl = document.getElementById('password');

    this.values.email = emailEl.value.trim().toLowerCase();
    this.values.password = passwordEl.value;
    this.fieldErrors = {};
    this.generalError = '';
    this.generalErrorHint = '';

    const emailError = validateEmail(this.values.email);
    const passwordError = validatePassword(this.values.password);

    if (emailError) this.fieldErrors.email = emailError;
    if (passwordError) this.fieldErrors.password = passwordError;

    if (emailError || passwordError) {
      await this.rerender();
      return;
    }

    this.loading = true;
    await this.rerender();

    const result = await AuthApi.login(this.values.email, this.values.password);

    this.loading = false;

    if (!result.success) {
      // Макет предусматривает отдельный текст для неверных данных входа и
      // общий текст о недоступности сервиса для остальных ошибок API.
      const isCredentialsError = result.code === ERROR_CODES.UNAUTHORIZED
        || result.code === ERROR_CODES.INVALID_CREDENTIALS
        || result.status === 400;
      const errorCode = isCredentialsError
        ? ERROR_CODES.INVALID_CREDENTIALS
        : [ERROR_CODES.NETWORK_ERROR, ERROR_CODES.INTERNAL_ERROR].includes(result.code)
          ? result.code
          : ERROR_CODES.INTERNAL_ERROR;
      this.generalError = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
      this.generalErrorHint = ERROR_HINTS[errorCode] || ERROR_HINTS[ERROR_CODES.UNKNOWN_ERROR];
      await this.rerender();
      return;
    }

    await showPage(ChatsPage);
  }
}
