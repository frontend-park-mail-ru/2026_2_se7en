export async function loadTemplate(templates, name) {
  if (templates[name]) return templates[name];

  const response = await fetch(`/templates/${name}.hbs`);
  const source = await response.text();
  templates[name] = Handlebars.compile(source);
  return templates[name];
}
