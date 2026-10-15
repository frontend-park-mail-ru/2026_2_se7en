import { debugError } from './DebugError';
import type { EventMap, EventName, EventListener } from '@/types/events';

/**
 * События без payload — те, у которых `EventMap[K] = void`.
 *
 * Вычисляется автоматически из `EventMap`: mapped-тип проходит по всем ключам,
 * оставляет имя ключа, если его payload — `void`, и `never` в остальных случаях.
 * При финальном объединении `never` исчезает, остаются только нужные ключи.
 */
type VoidEventName = {
  [K in EventName]: EventMap[K] extends void ? K : never;
}[EventName];

/**
 * События с payload — все, кроме `VoidEventName`.
 * Для таких событий `emit` обязан принимать вторым аргументом payload.
 */
type PayloadEventName = Exclude<EventName, VoidEventName>;

/**
 * Шина событий приложения.
 *
 * Позволяет компонентам общаться, не импортируя друг друга напрямую:
 * издатель вызывает `emit`, подписчики — `on`. Между ними нет прямых ссылок.
 *
 * @example
 *   // подписка
 *   const off = eventBus.on('snackbar:show', ({ text, type }) => {
 *     console.log(text, type);
 *   });
 *
 *   // публикация
 *   eventBus.emit('snackbar:show', { text: 'Готово', type: 'success' });
 *
 *   // отписка
 *   off();
 */
class EventBus {
  /**
   * Хранилище подписчиков.
   *
   * Ключ — имя события, значение — Set колбэков этого события.
   * События без подписчиков в объекте отсутствуют (отсюда `Partial`).
   */
  private listeners: Partial<Record<EventName, Set<EventListener<EventName>>>> = {};

  /**
   * Подписаться на событие.
   *
   * @param event Имя события из `EventMap`.
   * @param callback Обработчик. Получает payload, соответствующий событию.
   * @returns Функция отписки.
   *
   * @example
   *   const off = eventBus.on('user:login', ({ id, name }) => {
   *     console.log(`Вошёл ${name} (${id})`);
   *   });
   */
  on<K extends EventName>(event: K, callback: EventListener<K>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }

    this.listeners[event]!.add(callback as EventListener<EventName>);

    return () => this.off(event, callback);
  }

  /**
   * Отписаться от события.
   *
   * @param event Имя события.
   * @param callback Ссылка на тот же колбэк, что передавался в `on`.
   *                 Сравнение идёт по ссылке, не по содержимому.
   */
  off<K extends EventName>(event: K, callback: EventListener<K>): void {
    const subscribers = this.listeners[event];
    if (!subscribers) return;

    subscribers.delete(callback as EventListener<EventName>);

    if (subscribers.size === 0) {
      delete this.listeners[event];
    }
  }

  /**
   * Опубликовать событие без payload.
   *
   * Доступно только для событий из `VoidEventName`
   *
   * @param event Имя события из `EventMap` с payload типа `void`.
   */
  emit<K extends VoidEventName>(event: K): void;

  /**
   * Опубликовать событие с payload.
   *
   * Доступно только для событий из `PayloadEventName`
   *
   * @param event Имя события из `EventMap`.
   * @param payload Данные события, типизированные по `EventMap[K]`.
   */
  emit<K extends PayloadEventName>(event: K, payload: EventMap[K]): void;

  /**
   * Реализация `emit`. Снаружи не видна — публичный API описан двумя
   * перегрузками выше, TS проверяет вызовы только по ним.
   */
  emit(event: EventName, payload?: unknown): void {
    const subscribers = this.listeners[event];
    if (!subscribers) return;

    for (const callback of [...subscribers]) {
      try {
        (callback as (p: unknown) => void)(payload);
      } catch (error) {
        debugError(`EventBus: ошибка в обработчике "${String(event)}": ${error}`);
      }
    }
  }

  /**
   * Очистить подписчиков.
   *
   * Без аргумента — удаляет всех подписчиков всех событий.
   * С аргументом — только подписчиков указанного события.
   *
   * @param event Опционально: имя события, чьих подписчиков надо удалить.
   */
  clear<K extends EventName>(event?: K): void {
    if (event !== undefined) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

/**
 * Единственный экземпляр шины на всё приложение.
 */
export const eventBus = new EventBus();

export type { EventMap, EventName, EventListener };
