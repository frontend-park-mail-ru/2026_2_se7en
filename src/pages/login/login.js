import { AuthLayout } from '../../components/AuthLayout.js';
import { AuthForm } from '../../components/AuthForm.js';
import { AuthApi } from '../../api/auth/AuthApi.js';
import { validateEmail, validatePassword } from '../../helpers/validation.js';
import { APP_ID } from '../../constants/App.js';
import { debugError } from '../../helpers/error.js';

const FORM_ID = 'login-form';
const SUBMIT_ID = 'login-submit';

export class LoginPage {
  constructor() {
    this.container = null;
    this.fieldErrors = {};
    this.generalError = '';
    this.values = { email: '', password: '' };
  }

  render() {
    return AuthLayout({
      title: 'Общение, которое<br />всегда рядом',
      subtitle: 'Продолжайте разговоры на большом экране',
      children: AuthForm({
        formId: FORM_ID,
        submitId: SUBMIT_ID,
        title: 'С возвращением',
        subtitle: 'Введите адрес электронной почты, чтобы продолжить общение в Связь.',
        fields: this.buildFields(),
        submitText: 'Войти',
        footer:
          'Впервые здесь? <a href="/register" class="font-semibold text-gray-900 hover:underline">Создать аккаунт</a>',
        generalError: this.generalError,
      }),
    });
  }

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

  mount() {
    this.container = document.getElementById(APP_ID);
    if (!this.container) {
      debugError(`Элемент с id=${APP_ID} не найден`);
      return;
    }
    this.container.innerHTML = this.render();
    this.bindEvents();
  }

  rerender() {
    this.container.innerHTML = this.render();
    this.bindEvents();
  }

  bindEvents() {
    const form = document.getElementById(FORM_ID);
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit();
    });
  }

  async submit() {
    const emailEl = document.getElementById('email');
    const passwordEl = document.getElementById('password');

    this.values.email = emailEl.value.trim().toLowerCase();
    this.values.password = passwordEl.value;
    this.fieldErrors = {};
    this.generalError = '';

    const emailError = validateEmail(this.values.email);
    const passwordError = validatePassword(this.values.password);

    if (emailError) this.fieldErrors.email = emailError;
    if (passwordError) this.fieldErrors.password = passwordError;

    if (emailError || passwordError) {
      this.rerender();
      return;
    }

    const submitBtn = document.getElementById(SUBMIT_ID);
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Входим...';

    const result = await AuthApi.login(this.values.email, this.values.password);

    if (!result.success) {
      this.generalError = result.message;
      this.rerender();
      return;
    }

    window.location.href = '/';
  }
}
