import type { Contact, DisplayContact } from '@/api/contacts/contacts.types.ts';

/** Возвращает псевдоним контакта или его имя и фамилию. */
function getContactName(contact: Contact): string {
  if (contact.pseudonym?.trim()) return contact.pseudonym.trim();

  const firstName = contact.first_name;
  const lastName = contact.last_name ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName;
}

/** Подготавливает данные контакта для поиска по отображаемому имени, никнейму и имени + фамилии. */
function getContactSearchText(contact: Contact, displayName: string): string {
  const fullName = `${contact.first_name} ${contact.last_name ?? ''}`.trim();

  return [displayName, contact.nickname, fullName]
    .filter((name): name is string => Boolean(name?.trim()))
    .join(' ');
}

/** Формирует инициалы для аватара контакта. */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);

  return words.length > 1
    ? `${Array.from(words[0])[0]}${Array.from(words[1])[0]}`.toLocaleUpperCase('ru-RU')
    : Array.from(name).slice(0, 2).join('').toLocaleUpperCase('ru-RU');
}

/** Преобразует backend DTO контакта в формат отображения страницы. */
export function toDisplayContact(contact: Contact): DisplayContact {
  const name = getContactName(contact);

  return {
    id: contact.contact_user_id,
    name,
    searchText: getContactSearchText(contact, name),
    initials: getInitials(name),
    isOnline: contact.is_online,
  };
}
