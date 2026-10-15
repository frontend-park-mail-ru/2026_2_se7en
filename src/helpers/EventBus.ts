import { debugError } from './DebugError';
import { EventMap, EventName, EventListener } from '@/types/events';

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

  emit<K extends EventName>(
    event: K,
    ...args: EventMap[K] extends void ? [undefined?] : [EventMap[K]]
  ): void {
    const subscribers = this.listeners[event];
    if (!subscribers) return;

    const payload = args[0] as EventMap[K];

    for (const callback of [...subscribers]) {
      try {
        (callback as EventListener<K>)(payload);
      } catch {
        debugError(`Error! EventBus emit: "${String(event)}"`);
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
