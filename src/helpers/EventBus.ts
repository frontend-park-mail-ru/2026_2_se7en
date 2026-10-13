import { debugError } from './DebugError';
import { EventMap, EventName, EventListener } from '@/types/events';

class EventBus {
  private listeners = new Map<EventName, Set<EventListener<EventName>>>();

  on<K extends EventName>(event: K, callback: EventListener<K>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback as EventListener<EventName>);

    return () => this.off(event, callback);
  }

  off<K extends EventName>(event: K, callback: EventListener<K>): void {}

  emit<K extends EventName>(event: K, payload: EventMap[K]): void {}

  clear<K extends EventName>(event?: K): void {}
}

export const eventBus = new EventBus();

export type { EventMap, EventName, EventListener };
