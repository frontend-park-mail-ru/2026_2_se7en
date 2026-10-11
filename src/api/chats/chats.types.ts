export interface Chat {
  id: number;
}

export interface ChatsResponse {
  items: Chat[];
  total: number;
}

export interface GetChatsParams {
  limit?: number;
  offset?: number;
}
