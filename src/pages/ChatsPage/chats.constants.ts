import { MS_IN_SECOND } from '@/constants/Time.ts';

/** Время ожидания после последнего ввода перед отправкой typing.stop. */
export const TYPING_IDLE_MS = 2 * MS_IN_SECOND;

/** Максимальное время показа удалённого статуса набора без новых событий. */
export const REMOTE_TYPING_TIMEOUT_MS = 6 * MS_IN_SECOND;
