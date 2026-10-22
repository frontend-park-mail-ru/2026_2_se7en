export class Signal<T> {
  private listeners: (() => void)[] = [];
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
