import Handlebars from 'handlebars';

/**
 * Загружает и компилирует Handlebars-шаблон по имени.
 *
 * @param {Record<string, HandlebarsTemplateDelegate>} templates - Объект с уже загруженными шаблонами.
 * @param {string} name - Имя шаблона (без расширения .hbs).
 * @returns {Promise<Record<string, HandlebarsTemplateDelegate>>} Новый объект шаблонов, содержащий запрошенный шаблон.
 *
 * @example
 *   let templates = {};
 *   templates = await loadTemplate(templates, 'chat-item');
 *   const html = templates['chat-item']({ name: 'Алексей' });
 */
export async function loadTemplate(templates, name) {
  if (templates[name]) {
    return templates;
  }

  const response = await fetch(`/templates/${name}.hbs`);
  const source = await response.text();
  const compiled = Handlebars.compile(source);

  return {
    ...templates,
    [name]: compiled,
  };
}
