import { Button } from '@/components/core/Button.ts';
import type { PageDirection, PaginationState } from './PagedWindow.ts';

export function renderPageControl(
  direction: PageDirection,
  state: PaginationState,
  label: string,
  className?: string,
): string {
  if (!state[direction]) return '';
  return Button({
    text:
      state.pending === direction
        ? 'Загрузка…'
        : state.error === direction
          ? 'Повторить загрузку'
          : label,
    mode: 'unstyled',
    className,
    disabled: state.pending !== null,
    attrs: {
      'data-page-direction': direction,
      ...(state.error === direction ? {} : { 'data-page-observe': '' }),
    },
  });
}

/** Следит за границами списка и сохраняет положение при обновлении разметки. */
export class PagedScroll {
  private observer: IntersectionObserver | null = null;
  private key: string | undefined;
  private top = 0;
  private pinned = false;
  private anchor: { id: string; top: number } | null = null;

  constructor(
    private readonly rootSelector: string,
    private readonly load: (direction: PageDirection) => void,
    private readonly startAtBottom = false,
  ) {}

  capture(container: HTMLElement): void {
    this.disconnect();
    const root = container.querySelector<HTMLElement>(this.rootSelector);
    this.key = root?.dataset.scrollKey;
    this.anchor = null;
    this.top = root?.scrollTop ?? 0;
    this.pinned = false;
    if (!root || !root.clientHeight) return;

    const bounds = root.getBoundingClientRect();
    this.pinned =
      this.startAtBottom &&
      !root.querySelector('[data-page-direction="previous"]') &&
      root.scrollHeight - root.clientHeight - root.scrollTop <= 2;
    for (const row of root.querySelectorAll<HTMLElement>('[data-scroll-row]')) {
      const rect = row.getBoundingClientRect();
      if (rect.bottom > bounds.top && rect.top < bounds.bottom) {
        this.anchor = { id: row.dataset.scrollRow!, top: rect.top - bounds.top };
        break;
      }
    }
  }

  connect(container: HTMLElement): void {
    const root = container.querySelector<HTMLElement>(this.rootSelector);
    if (!root) return;

    if (this.key !== root.dataset.scrollKey || this.pinned) {
      root.scrollTop = this.startAtBottom ? root.scrollHeight : 0;
    } else {
      root.scrollTop = this.top;
      const anchor = this.anchor;
      if (anchor) {
        const row = [...root.querySelectorAll<HTMLElement>('[data-scroll-row]')].find(
          (item) => item.dataset.scrollRow === anchor.id,
        );
        if (row) {
          root.scrollTop +=
            row.getBoundingClientRect().top - root.getBoundingClientRect().top - anchor.top;
        }
      }
    }

    const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-page-direction]')];
    for (const button of buttons) {
      button.onclick = () => this.load(button.dataset.pageDirection as PageDirection);
    }
    if (!buttons.some((button) => !button.disabled) || typeof IntersectionObserver === 'undefined')
      return;

    this.observer = new IntersectionObserver(
      (entries, observer) => {
        if (observer !== this.observer || !root.clientHeight) return;
        const visible = entries.filter((entry) => entry.isIntersecting);
        const next = visible.find(
          (entry) => (entry.target as HTMLElement).dataset.pageDirection === 'next',
        );
        const entry = next ?? (root.scrollHeight > root.clientHeight ? visible[0] : undefined);
        if (entry)
          this.load((entry.target as HTMLButtonElement).dataset.pageDirection as PageDirection);
      },
      { root, rootMargin: '120px 0px' },
    );
    for (const button of buttons) {
      if (!button.disabled && button.hasAttribute('data-page-observe'))
        this.observer.observe(button);
    }
  }

  disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
