import Handlebars from 'handlebars';
import { Field } from './Field.js';

const template = Handlebars.compile(`
  <div class="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
    <h2 class="text-[32px] font-bold leading-[120%] tracking-[-0.5px] text-gray-900 mb-1">{{title}}</h2>
    <p class="text-gray-500 text-sm mb-6">{{subtitle}}</p>

    <form id="{{formId}}" class="space-y-4" novalidate>
      {{{fieldsHtml}}}

      <div class="pt-2">
        <button
          type="submit"
          id="{{submitId}}"
          class="w-full bg-black text-white py-3.5 px-4 rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {{submitText}}
        </button>
      </div>

      <div class="text-center mt-4">
        <p class="text-gray-500 text-sm">{{{footer}}}</p>
      </div>
    </form>
  </div>
`);

export function AuthForm({ formId, submitId, title, subtitle, fields, submitText, footer }) {
  const fieldsHtml = fields.map((f) => Field(f)).join('');
  return template({ formId, submitId, title, subtitle, fieldsHtml, submitText, footer });
}
