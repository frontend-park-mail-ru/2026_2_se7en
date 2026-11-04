type Listener = () => void;

/**
 * Реактивная ячейка состояния.
 *
 * Хранит одно значение и список подписчиков. Доступ к значению идёт через
 * свойство `value`, перехватываемое Proxy: чтение возвращает текущее
 * значение, запись — обновляет его и вызывает всех подписчиков.
 *
 * По умолчанию запись того же значения (Object.is) не вызывает подписчиков.
 * Чтобы уведомить их принудительно — используйте `setValue(value, true)`.
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
          target.setValue(newValue);
          return true;
        }

        return Reflect.set(target, prop, newValue);
      },
    });
  }

  /**
   * Устанавливает значение сигнала.
   *
   * @param value Новое значение.
   * @param force Если `true` — подписчики вызываются даже при совпадении
   *              значений (`Object.is`).
   */
  setValue(value: T, force = false): void {
    if (!force && Object.is(this.storedValue, value)) {
      return;
    }

    this.storedValue = value;
    this.listeners.forEach((func) => func());
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
