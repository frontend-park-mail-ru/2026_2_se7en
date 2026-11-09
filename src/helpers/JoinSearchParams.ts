/**
 * Тип значения для query-параметра.
 */
type SearchParamValue = string | number | boolean | null | undefined;

/**
 * Объект с query-параметрами.
 */
type SearchParams = Record<string, SearchParamValue | SearchParamValue[]>;

/**
 * Преобразует объект параметров в строку URLSearchParams.
 * Автоматически конвертирует числа/булевы в строки и фильтрует undefined/null.
 */
export function joinSearchParams(params: SearchParams): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value == undefined || value == null) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      }
    } else {
      searchParams.append(key, String(value));
    }
  }

  return searchParams.toString();
}
