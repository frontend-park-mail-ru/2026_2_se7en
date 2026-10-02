import { validateEmail, validatePassword } from '../../helpers/validation.js';
import { APP_ID } from '../../constants/App.js';

export class LoginPage {
  render() {
    return `
      <div class="min-h-screen flex">
        <div class="hidden md:flex md:w-1/2 bg-slate-50 flex-col justify-between p-10">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-black"></div>
            <span class="text-xl font-bold">SVяZъ</span>
          </div>

          <div>
            <h2 class="text-4xl font-bold leading-tight mb-3">
              Общение, которое<br />всегда рядом
            </h2>
            <p class="text-gray-500">
              Продолжайте разговоры на большом экране
            </p>
          </div>
        </div>

        <div class="w-full md:w-1/2 flex items-center justify-center p-6 bg-white">
          <div class="w-full max-w-md border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h1 class="text-2xl font-bold mb-2">С возвращением</h1>
            <p class="text-gray-500 text-sm mb-6">
              Введите адрес электронной почты, чтобы продолжить общение в Связь.
            </p>

            <div class="mb-4">
              <label for="email" class="block text-sm text-gray-600 mb-1">
                Электронная почта
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
              <span id="email-error" class="block text-sm text-red-500 mt-1"></span>
            </div>

            <div class="mb-6">
              <label for="password" class="block text-sm text-gray-600 mb-1">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                placeholder="password"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
              <span id="password-error" class="block text-sm text-red-500 mt-1"></span>
            </div>

            <p id="general-error" class="text-sm text-red-500 mb-3"></p>

            <button
              id="submit-btn"
              class="w-full py-2 rounded-full bg-black text-white font-medium hover:bg-gray-800"
            >
              Добро пожаловать!
            </button>

            <p class="text-sm text-gray-500 text-center mt-6">
              Впервые здесь?
              <a href="#" class="text-black font-semibold hover:underline">
                Создать аккаунт
              </a>
            </p>
          </div>
        </div>
      </div>
    `;
  }

  mount() {
    const container = document.getElementById(APP_ID);
    if (!container) {
      console.error(`Элемент с id=${APP_ID} не найден`);
      return;
    }

    container.innerHTML = this.render();

    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('submit-btn').addEventListener('click', () => {
      this.submit();
    });
  }

  async submit() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    document.getElementById('email-error').textContent = '';
    document.getElementById('password-error').textContent = '';
    document.getElementById('general-error').textContent = '';

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError) {
      document.getElementById('email-error').textContent = emailError;
    }

    if (passwordError) {
      document.getElementById('password-error').textContent = passwordError;
    }

    if (emailError || passwordError) return;

    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 401) {
        document.getElementById('general-error').textContent = 'Неверный email или пароль';
        return;
      }

      if (!response.ok) {
        document.getElementById('general-error').textContent = 'Не удалось войти';
        return;
      }

      window.location.href = '/';
    } catch (error) {
      console.error(error);
      document.getElementById('general-error').textContent = 'Сервер недоступен';
    }
  }
}
