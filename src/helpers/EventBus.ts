import { debugError } from './DebugError';
import { EventMap, EventName, EventListener } from '@/types/events';

type VoidEventName = {
  [K in EventName]: EventMap[K] extends void ? K : never;
}[EventName];

type PayloadEventName = Exclude<EventName, VoidEventName>;

class EventBus {
  private listeners: Partial<Record<EventName, Set<EventListener<EventName>>>> = {};

  on<K extends EventName>(event: K, callback: EventListener<K>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }

    this.listeners[event]!.add(callback as EventListener<EventName>);

    return () => this.off(event, callback);
  }

  off<K extends EventName>(event: K, callback: EventListener<K>): void {
    const subscribers = this.listeners[event];
    if (!subscribers) return;

    subscribers.delete(callback as EventListener<EventName>);

    if (subscribers.size === 0) {
      delete this.listeners[event];
    }
  }

  emit<K extends VoidEventName>(event: K): void;
  emit<K extends PayloadEventName>(event: K, payload: EventMap[K]): void;
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

  clear<K extends EventName>(event?: K): void {
    if (event !== undefined) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

export const eventBus = new EventBus();

export type { EventMap, EventName, EventListener };
