type Listener = () => void;

/**
 * Реактивная ячейка состояния.
 *
 * Хранит одно значение и список подписчиков. При изменении значения через
 * {@link Signal.set} все подписчики вызываются автоматически.
 */
export class Signal<T> {
  private listeners: Listener[] = [];
  private value: T;

  constructor(init_value: T) {
    this.value = init_value;
  }

  get(): T {
    return this.value;
  }

  set(_value: T): void {
    this.value = _value;
    this.listeners.forEach((func) => func());
  }

  subscribe(func: () => void): void {
    this.listeners.push(func);
  }
}
