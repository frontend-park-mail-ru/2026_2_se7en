/**Приводит строку к нижнему регистру */
export function toRuLowerCase(str: string): string {
  return str.toLocaleLowerCase('ru-RU');
}

/** Приводит строку к верхнему регистру */
export function toRuUpperCase(str: string): string {
  return str.toLocaleUpperCase('ru-RU');
}
