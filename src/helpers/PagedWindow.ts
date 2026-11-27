import { ApiError } from '@/api/ApiResponse.ts';
import { Signal } from '@/reactive/Signal.ts';

export type PageDirection = 'previous' | 'next';
type PageRequest = PageDirection | 'refresh';

interface Page<T, Cursor> {
  items: T[];
  next: Cursor | null;
  previous?: Cursor | null;
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

  reset(cursor: Cursor | null = null): void {
    this.version += 1;
    this.pages = [];
    this.cursors = [cursor];
    this.first = 0;
    this.publish(null);
  }

  async load(request: PageRequest): Promise<ApiError | void> {
    const state = this.state.value;
    if (state.pending) return;
    if ((request === 'previous' && !state.previous) || (request === 'next' && !state.next)) return;

    const version = this.version;
    const first = this.pages[0];
    const last = this.pages[this.pages.length - 1];
    const linked = first?.previous !== undefined;
    let index = this.first;
    if (request === 'previous' && !linked) index -= 1;
    if (request === 'next' && !linked) index += this.pages.length;

    const rebuild = request === 'refresh' || (request === 'previous' && !linked && index === 0);
    const count = rebuild ? this.pages.length || 1 : 1;
    let cursor = this.cursors[index];
    if (request === 'next') cursor = last.next;
    if (request === 'previous' && linked) cursor = first.previous!;
    if (request === 'refresh' && linked) cursor = null;
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

    if (!linked) this.cursors.splice(index, cursors.length, ...cursors);
    if (rebuild) {
      this.first = index;
      this.pages = pages;
      this.cursors.length = index + pages.length;
    } else if (request === 'previous') {
      this.first = index;
      if (linked && !pages[0].items.length) {
        first.previous = null;
      } else {
        this.pages.unshift(pages[0]);
        if (this.pages.length > WINDOW_SIZE) this.pages.pop();
      }
    } else if (pages[0].items.length || pages[0].next !== null) {
      this.pages.push(pages[0]);
      if (this.pages.length > WINDOW_SIZE) {
        this.pages.shift();
        if (!linked) this.first += 1;
      }
    } else {
      last.next = null;
    }

    this.publish(null);
  }

  prependRecent(
    items: T[],
    pageSize: number,
    olderCursor: (item: T) => Cursor,
    newerCursor: (item: T) => Cursor,
  ): void {
    if (
      this.state.value.previous ||
      this.state.value.pending ||
      !this.pages.length ||
      !items.length
    )
      return;
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
      const next = hasNext ? olderCursor(page[page.length - 1]) : null;
      const previous = offset > 0 ? newerCursor(page[0]) : null;
      this.pages.push({ items: page, next, previous });
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
      previous:
        this.pages[0]?.previous !== undefined ? this.pages[0].previous !== null : this.first > 0,
      next: this.pages.length > 0 && this.pages[this.pages.length - 1].next !== null,
      pending: null,
      error,
    };
  }
}
