import { ApiError } from '@/api/ApiResponse.ts';
import { Signal } from '@/reactive/Signal.ts';

export type PageDirection = 'previous' | 'next';
type PageRequest = PageDirection | 'refresh';

interface Page<T, Cursor> {
  items: T[];
  next: Cursor | null;
}

export interface PaginationState {
  previous: boolean;
  next: boolean;
  pending: PageRequest | null;
  error: PageRequest | null;
}

const WINDOW_SIZE = 3;

/** Хранит до трёх соседних страниц и курсоры для обратной прокрутки. */
export class PagedWindow<T extends { id: string }, Cursor> {
  readonly items = new Signal<T[]>([]);
  readonly state = new Signal<PaginationState>({
    previous: false,
    next: false,
    pending: null,
    error: null,
  });

  private pages: Page<T, Cursor>[] = [];
  private cursors: (Cursor | null)[] = [null];
  private first = 0;
  private version = 0;

  constructor(
    private readonly fetchPage: (cursor: Cursor | null) => Promise<Page<T, Cursor> | ApiError>,
  ) {}

  reset(): void {
    this.version += 1;
    this.pages = [];
    this.cursors = [null];
    this.first = 0;
    this.publish(null);
  }

  async load(request: PageRequest): Promise<ApiError | void> {
    const state = this.state.value;
    if (state.pending) return;
    if ((request === 'previous' && !state.previous) || (request === 'next' && !state.next)) return;

    const version = this.version;
    const last = this.pages[this.pages.length - 1];
    let index = this.first;
    if (request === 'previous') index -= 1;
    if (request === 'next') index += this.pages.length;

    const rebuild = request === 'refresh' || (request === 'previous' && index === 0);
    const count = rebuild ? this.pages.length || 1 : 1;
    let cursor = request === 'next' ? last.next : this.cursors[index];
    const pages: Page<T, Cursor>[] = [];
    const cursors: (Cursor | null)[] = [];
    this.state.value = { ...state, pending: request, error: null };

    while (pages.length < count) {
      const result = await this.fetchPage(cursor);
      if (version !== this.version) return;
      if (result instanceof ApiError) {
        this.state.value = { ...state, error: request };
        return result;
      }

      cursors.push(cursor);
      pages.push(result);
      cursor = result.next;
      if (cursor === null) break;
    }

    this.cursors.splice(index, cursors.length, ...cursors);
    if (rebuild) {
      this.first = index;
      this.pages = pages;
      this.cursors.length = index + pages.length;
    } else if (request === 'previous') {
      this.first = index;
      this.pages.unshift(pages[0]);
      if (this.pages.length > WINDOW_SIZE) this.pages.pop();
    } else if (pages[0].items.length || pages[0].next !== null) {
      this.pages.push(pages[0]);
      if (this.pages.length > WINDOW_SIZE) {
        this.pages.shift();
        this.first += 1;
      }
    } else {
      last.next = null;
    }

    this.publish(null);
  }

  prependRecent(items: T[], pageSize: number, cursorFor: (item: T) => Cursor): void {
    if (this.first !== 0 || this.state.value.pending || !this.pages.length || !items.length) return;
    const known = new Set(this.items.value.map((item) => item.id));
    const additions = items.filter((item) => {
      if (known.has(item.id)) return false;
      known.add(item.id);
      return true;
    });
    if (!additions.length) return;

    const all = additions.concat(this.items.value);
    const capacity = WINDOW_SIZE * pageSize;
    this.pages = [];
    this.cursors = [null];
    for (let offset = 0; offset < Math.min(all.length, capacity); offset += pageSize) {
      const page = all.slice(offset, offset + pageSize);
      const hasNext = offset + page.length < all.length || this.state.value.next;
      const next = hasNext ? cursorFor(page[page.length - 1]) : null;
      this.pages.push({ items: page, next });
      this.cursors.push(next);
    }
    this.publish(this.state.value.error);
  }

  updateItems(update: (item: T) => T | null): void {
    for (const page of this.pages) {
      page.items = page.items.map(update).filter((item): item is T => item !== null);
    }
    this.publishItems();
  }

  private publishItems(): void {
    this.items.value = [
      ...new Map(this.pages.flatMap((page) => page.items).map((item) => [item.id, item])).values(),
    ];
  }

  private publish(error: PageRequest | null): void {
    this.publishItems();
    this.state.value = {
      previous: this.first > 0,
      next: this.pages.length > 0 && this.pages[this.pages.length - 1].next !== null,
      pending: null,
      error,
    };
  }
}
