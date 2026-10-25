type Listener = () => void;

/**
 * Реактивная ячейка состояния.
 *
 * Хранит одно значение и список подписчиков. Доступ к значению идёт через
 * свойство `value`, перехватываемое Proxy: чтение возвращает текущее
 * значение, запись — обновляет его и вызывает всех подписчиков.
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
          target.storedValue = newValue;
          target.listeners.forEach((func) => func());
          return true;
        }

        return Reflect.set(target, prop, newValue);
      },
    });
  }

  subscribe(func: Listener): void {
    this.listeners.push(func);
  }

  unsubscribe(func: Listener): void {
    this.listeners = this.listeners.filter((f) => f !== func);
  }
}
