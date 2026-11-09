import type { GroupFormView } from './chat.types.ts';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function validateAvatar(file: File | null): string {
  if (!file) return '';

  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    return 'Выберите PNG, JPEG или WebP.';
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return 'Размер фотографии не должен превышать 5 МБ.';
  }

  return '';
}

export function validateGroupForm(
  form: GroupFormView,
  memberCount: number,
  avatarFile: File | null,
): boolean {
  const name = (form.name ?? '').trim();
  const description = (form.description ?? '').trim();

  form.nameError = !name
    ? 'Введите название группы.'
    : Array.from(name).length > 100
      ? 'Название не должно превышать 100 символов.'
      : '';

  form.descriptionError =
    Array.from(description).length > 500 ? 'Описание не должно превышать 500 символов.' : '';

  form.membersError = memberCount > 100 ? 'В группе может быть не больше 100 участников.' : '';

  form.avatarError = validateAvatar(avatarFile);

  return !(form.nameError || form.descriptionError || form.membersError || form.avatarError);
}
