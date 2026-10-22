import Handlebars from 'handlebars';

/** Скомпилированный Handlebars-шаблон. */
export type CompiledTemplate = (context?: unknown) => string;

export type Templates = Record<string, CompiledTemplate>;

/**
 * Загружает и компилирует Handlebars-шаблон по имени.
 */
export async function loadTemplate(templates: Templates, name: string): Promise<Templates> {
  if (templates[name]) {
    return templates;
  }

  const response = await fetch(`/templates/${name}.hbs`);
  const source = await response.text();
  const compiled = Handlebars.compile(source) as CompiledTemplate;

  return {
    ...templates,
    [name]: compiled,
  };
}
