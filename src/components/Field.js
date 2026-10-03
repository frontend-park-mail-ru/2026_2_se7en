import Handlebars from 'handlebars';

const template = Handlebars.compile(`
  <div>
    <label for="{{id}}" class="block text-xs font-medium {{#if error}}text-red-500{{else}}text-gray-500{{/if}} mb-1.5">
      {{label}}
    </label>
    <input
      type="{{type}}"
      id="{{id}}"
      name="{{name}}"
      placeholder="{{placeholder}}"
      value="{{value}}"
      class="w-full px-4 py-3 bg-[#f5f9ff] border {{#if error}}border-red-500{{else}}border-transparent{{/if}} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
    />
    {{#if error}}
      <p class="text-red-500 text-xs mt-1.5">{{error}}</p>
    {{/if}}
  </div>
`);

export function Field({
  id,
  name,
  type = 'text',
  label,
  placeholder = '',
  value = '',
  error = '',
}) {
  return template({ id, name, type, label, placeholder, value, error });
}
