import Handlebars from 'handlebars';

const template = Handlebars.compile(`
  <div class="min-h-screen flex bg-white">
    <div class="hidden lg:flex lg:w-1/2 bg-[#f5f9ff] p-12 flex-col">
      <div class="flex items-center gap-3">
        <img src="/public/pictures/icon.png" alt="Логотип" class="w-12 h-12 rounded-xl object-cover" />
        <span class="text-2xl font-semibold text-gray-900">Связь</span>
      </div>

      <div class="flex-1 flex items-center">
        <div class="max-w-md">
          <h1 class="text-gray-900 mb-4">{{title}}</h1>
          <p class="text-gray-500 text-lg leading-relaxed">{{subtitle}}</p>
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

export function AuthLayout({ title, subtitle, topBar = '', children }) {
  return template({ title, subtitle, topBar, children });
}
