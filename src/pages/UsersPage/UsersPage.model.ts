import { ApiError } from '@/api/ApiResponse.ts';
import { ERROR_CODES } from '@/api/error.constants.ts';
import { STATUSES } from '@/constants/Statuses.ts';
import { Signal } from '@/reactive/Signal.ts';
import { USERS_PAGE_SIZE } from '@/api/users/users.constants.ts';
import type { UserSearchItem } from '@/api/users/users.types.ts';
import { UsersApi } from '@/api/users/UsersApi.ts';
import { debugError } from '@/helpers/DebugError.ts';

export class UsersPageModel {
  readonly users = new Signal<UserSearchItem[]>([]);
  readonly isLoading = new Signal(false);
  readonly isLoadingMore = new Signal(false);
  readonly hasError = new Signal(false);
  readonly nextOffset = new Signal<number | null>(null);
  query = '';

  private requestVersion = 0;

  destroy(): void {
    this.requestVersion += 1;
  }

  async search(query: string): Promise<void> {
    this.query = query.trim();
    const version = ++this.requestVersion;
    this.users.value = [];
    this.nextOffset.value = null;
    this.isLoadingMore.value = false;
    this.hasError.value = false;

    if (!this.query) {
      this.isLoading.value = false;
      return;
    }

    this.isLoading.value = true;
    const result = await UsersApi.getUsers({ q: this.query, limit: USERS_PAGE_SIZE, offset: 0 });
    if (version !== this.requestVersion) return;

    if (result instanceof ApiError) {
      this.handleError(result);
    } else {
      this.users.value = result.data?.items ?? [];
      this.nextOffset.value = result.data?.next_offset ?? null;
    }
    this.isLoading.value = false;
  }

  async loadMore(): Promise<void> {
    const offset = this.nextOffset.value;
    const query = this.query;
    if (offset === null || this.isLoadingMore.value) return;

    const version = this.requestVersion;
    this.isLoadingMore.value = true;
    const result = await UsersApi.getUsers({ q: query, limit: USERS_PAGE_SIZE, offset });
    if (version !== this.requestVersion) return;

    if (result instanceof ApiError) {
      this.handleError(result);
    } else {
      this.users.value = [...this.users.value, ...(result.data?.items ?? [])];
      this.nextOffset.value = result.data?.next_offset ?? null;
    }
    this.isLoadingMore.value = false;
  }

  private handleError(error: ApiError): void {
    if (error.status !== STATUSES.UNAUTHORIZED) {
      this.hasError.value = true;
      if (error.code !== ERROR_CODES.NETWORK_ERROR) debugError(error.message);
    }
  }
}
