import type { ApiResult } from '@/api/ApiResponse.ts';
import { ServerApi } from '@/api/ServerApi.ts';
import { USING_MOCK } from '@/api/api.constants.ts';
import { joinSearchParams } from '@/helpers/JoinSearchParams.ts';
import { mockGetChats } from '@/api/chats/chats.mock.ts';
import type {
  ChatDetailResponse,
  ChatMember,
  ChatMessage,
  ChatsResponse,
  CreateGroupRequest,
  GetChatsParams,
  ListMembersResponse,
  ListMessagesResponse,
  UpdateGroupRequest,
} from '@/api/chats/chats.types.ts';
import {
  GET_CHATS_URL,
  chatMembersUrl,
  chatMessagesUrl,
  chatUrl,
} from '@/api/chats/chats.constants.ts';

/**
 * API чатов.
 */
export class ChatsApi extends ServerApi {
  static async getChats(params: GetChatsParams = {}): Promise<ApiResult<ChatsResponse>> {
    const paramsWithDefaults = { limit: 50, ...params };

    if (USING_MOCK.CHATS) {
      return mockGetChats(paramsWithDefaults);
    }

    return this._request<ChatsResponse>(`${GET_CHATS_URL}?${joinSearchParams(paramsWithDefaults)}`);
  }

  static getChat(id: string): Promise<ApiResult<ChatDetailResponse>> {
    return this._request<ChatDetailResponse>(chatUrl(id));
  }

  static getMessages(id: string, before?: string): Promise<ApiResult<ListMessagesResponse>> {
    const query = new URLSearchParams({ limit: '50' });
    if (before) query.set('before', before);

    return this._request<ListMessagesResponse>(`${chatMessagesUrl(id)}?${query.toString()}`);
  }

  static sendMessage(id: string, content: string): Promise<ApiResult<ChatMessage>> {
    return this._request<ChatMessage>(chatMessagesUrl(id), {
      method: 'POST',
      body: { content, type: 'text' },
    });
  }

  static getMembers(id: string): Promise<ApiResult<ListMembersResponse>> {
    return this._request<ListMembersResponse>(chatMembersUrl(id));
  }

  static createGroup(data: CreateGroupRequest): Promise<ApiResult<ChatDetailResponse>> {
    return this._request<ChatDetailResponse>(`${GET_CHATS_URL}/groups`, {
      method: 'POST',
      body: data,
    });
  }

  static updateGroup(id: string, data: UpdateGroupRequest): Promise<ApiResult<ChatDetailResponse>> {
    return this._request<ChatDetailResponse>(chatUrl(id), {
      method: 'PATCH',
      body: data,
    });
  }

  static deleteChat(id: string): Promise<ApiResult<void>> {
    return this._request<void>(chatUrl(id), { method: 'DELETE' });
  }

  static leaveGroup(id: string): Promise<ApiResult<void>> {
    return this._request<void>(`${chatUrl(id)}/leave`, {
      method: 'DELETE',
    });
  }

  static removeMember(chatId: string, userId: string): Promise<ApiResult<void>> {
    return this._request<void>(`${chatMembersUrl(chatId)}/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
  }

  static addMember(chatId: string, userId: string): Promise<ApiResult<ChatMember>> {
    return this._request<ChatMember>(chatMembersUrl(chatId), {
      method: 'POST',
      body: { user_id: userId },
    });
  }

  static updateMemberRole(
    chatId: string,
    userId: string,
    role: 'admin' | 'member',
  ): Promise<ApiResult<ChatMember>> {
    return this._request<ChatMember>(
      `${chatMembersUrl(chatId)}/${encodeURIComponent(userId)}/role`,
      {
        method: 'PATCH',
        body: { role },
      },
    );
  }

  static uploadGroupAvatar(id: string, file: File): Promise<ApiResult<ChatDetailResponse>> {
    const body = new FormData();
    body.append('file', file);
    return this._request<ChatDetailResponse>(`${chatUrl(id)}/avatar`, { method: 'PUT', body });
  }

  static createDialog(peerId: string): Promise<ApiResult<ChatDetailResponse>> {
    return this._request<ChatDetailResponse>(`${GET_CHATS_URL}/dialogs`, {
      method: 'POST',
      body: { peer_id: peerId },
    });
  }
}
