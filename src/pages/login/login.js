import { AuthLayout } from '../../components/AuthLayout.js';
import { AuthForm } from '../../components/AuthForm.js';
import { AuthApi } from '../../api/auth/AuthApi.js';
import { validateEmail, validatePassword } from '../../helpers/validation.js';
import { APP_ID } from '../../constants/App.js';
import { debugError } from '../../helpers/error.js';
import { ROUTES } from '../../constants/Routes.js';
import { LOGIN_FORM_ID, LOGIN_SUBMIT_ID } from '../../constants/Login.js';
import { ERROR_CODES, ERROR_HINTS } from '../../api/error.constants.js';

/**
 * Страница авторизации.
 * Отвечает за рендеринг формы, клиентскую валидацию и отправку данных на сервер.
 */
export class LoginPage {
  constructor() {
    this.container = null;
    this.fieldErrors = {};
    this.generalError = '';
    this.generalErrorHint = '';
    this.loading = false;
    this.values = { email: '', password: '' };
  }

  /**
   * Генерирует HTML-разметку страницы: лейаут с формой логина.
   *
   * @returns {string} HTML-строка с разметкой страницы.
   */
  render() {
    return AuthLayout({
      title: 'Общение, которое<br />всегда рядом',
      subtitle: 'Продолжайте разговоры на большом экране',
      children: AuthForm({
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
      }),
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
  mount() {
    this.container = document.getElementById(APP_ID);
    if (!this.container) {
      debugError(`Элемент с id=${APP_ID} не найден`);
      return;
    }
    this.container.innerHTML = this.render();
    this.bindEvents();
  }

  /**
   * Перерисовывает страницу с сохранением текущего состояния.
   */
  rerender() {
    this.container.innerHTML = this.render();
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

    btn.querySelector('[data-eye="closed"]')?.classList.toggle('hidden', show);
    btn.querySelector('[data-eye="open"]')?.classList.toggle('hidden', !show);
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
      this.rerender();
      return;
    }

    this.loading = true;
    this.rerender();

    const result = await AuthApi.login(this.values.email, this.values.password);

    this.loading = false;

    if (!result.success) {
      this.generalError = result.message;
      this.generalErrorHint = ERROR_HINTS[result.code] || ERROR_HINTS[ERROR_CODES.UNKNOWN_ERROR];
      this.rerender();
      return;
    }

    window.location.href = ROUTES.HOME;
  }
}
