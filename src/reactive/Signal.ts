type Listener = () => void;

/**
 * Реактивная ячейка состояния.
 *
 * Хранит одно значение и список подписчиков. Доступ к значению идёт через
 * свойство `value`, перехватываемое Proxy: чтение возвращает текущее
 * значение, запись — обновляет его и вызывает всех подписчиков.
 *
 * По умолчанию запись того же значения (Object.is) не вызывает подписчиков.
 */
export class Signal<T> {
  declare value: T;

  private listeners: Listener[] = [];
  private storedValue: T;

  constructor(initialValue: T) {
    this.storedValue = initialValue;

    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop === 'value') {
          return target.storedValue;
        }

        const field = Reflect.get(target, prop, receiver);

        return typeof field === 'function' ? field.bind(target) : field;
      },

      set(target, prop, newValue) {
        if (prop === 'value') {
          if (Object.is(target.storedValue, newValue)) {
            return true;
          }

          target.setValue(newValue);
          target.listeners.forEach((func) => func());

          return true;
        }

        return Reflect.set(target, prop, newValue);
      },
    });
  }

  /**
   * Записывает новое значение во внутреннее хранилище.
   *
   * Отвечает только за установку значения;
   */
  private setValue(value: T): void {
    this.storedValue = value;
  }

  /**
   * Подписывает функцию на изменения значения сигнала.
   */
  subscribe(func: Listener): void {
    this.listeners.push(func);
  }

  /**
   * Убирает функцию из подписчиков сигнала.
   */
  unsubscribe(func: Listener): void {
    this.listeners = this.listeners.filter((f) => f !== func);
  }
}
