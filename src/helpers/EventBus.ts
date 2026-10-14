import { debugError } from './DebugError';
import { EventMap, EventName, EventListener } from '@/types/events';

class EventBus {
  private listeners = new Map<EventName, Set<EventListener<EventName>>>();

  on<K extends EventName>(event: K, callback: EventListener<K>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());

    this.listeners.get(event)!.add(callback as EventListener<EventName>);

    return () => this.off(event, callback);
  }

  off<K extends EventName>(event: K, callback: EventListener<K>): void {
    const subscribers = this.listeners.get(event);
    if (!subscribers) return;

    subscribers.delete(callback as EventListener<EventName>);

    if (subscribers.size === 0) this.listeners.delete(event);
  }

  emit<K extends EventName>(event: K, payload: EventMap[K]): void {
    const subscribers = this.listeners.get(event);
    if (!subscribers) return;

    for (const callback of [...subscribers]) {
      try {
        (callback as EventListener<K>)(payload);
      } catch {
        debugError('Error! EventBus emit: "${String(event)}"');
      }
    }
  }

  clear<K extends EventName>(event?: K): void {
    if (event !== undefined) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export const eventBus = new EventBus();

export type { EventMap, EventName, EventListener };
