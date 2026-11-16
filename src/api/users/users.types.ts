export interface UserSearchItem {
  user_id: string;
  nickname: string;
  first_name: string;
  last_name?: string | null;
  icon_id?: string | null;
  icon_url?: string | null;
  is_online: boolean;
  is_contact: boolean;
}

export interface UsersListResponse {
  items: UserSearchItem[];
  next_offset?: number;
}
