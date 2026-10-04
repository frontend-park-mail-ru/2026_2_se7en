import Handlebars from 'handlebars';

const template = Handlebars.compile(`
  <div class="min-h-screen flex bg-white">
    <div class="hidden lg:flex lg:w-1/2 bg-[#f5f9ff] p-12 flex-col">
      <div class="flex items-center gap-3">
        <img src="/pictures/icon.png" alt="Логотип" class="w-12 h-12 rounded-xl object-cover" />
        <span class="text-2xl font-semibold text-gray-900">Связь</span>
      </div>

      <div class="flex-1 flex items-center">
        <div class="max-w-md">
          <h1 class="text-[44px] font-bold leading-[108%] tracking-[-1.5px] text-gray-900 mb-4">{{{title}}}</h1>
          <p class="text-gray-500 text-lg leading-relaxed">{{{subtitle}}}</p>
        </div>
      </div>
    </div>

    <div class="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col">
      {{{topBar}}}

      <div class="flex-1 flex items-center justify-center">
        <div class="w-full max-w-md relative">
          {{{children}}}
        </div>
      </div>
    </div>
  </div>
`);

/**
 * Генерирует HTML-разметку split-screen лейаута для страниц авторизации.
 * Слева — логотип и текст-приглашение, справа — переданный контент (форма).
 *
 * @param {Object} params
 * @param {string} params.title - Заголовок левой панели (можно с <br />).
 * @param {string} params.subtitle - Подпись под заголовком.
 * @param {string} [params.topBar=''] - HTML верхней панели правой половины (шаги, «Назад»).
 * @param {string} params.children - HTML правой половины (обычно AuthForm).
 * @returns {string} HTML-строка со всей страницей.
 */
export function AuthLayout({ title, subtitle, topBar = '', children }) {
  return template({ title, subtitle, topBar, children });
}
