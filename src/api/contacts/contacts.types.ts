/** Контакт в формате ответа backend. */
export interface Contact {
  user_id: string;
  contact_user_id: string;
  pseudonym?: string | null;
  nickname: string;
  first_name: string;
  last_name?: string | null;
  icon_id?: string | null;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}

/** Ответ GET /api/v1/contacts. */
export interface ContactsResponse {
  items: Contact[];
}

/** Контакт, подготовленный для отображения. */
export interface DisplayContact {
  id: string;
  name: string;
  searchText: string;
  initials: string;
  isOnline: boolean;
}
