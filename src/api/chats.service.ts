import { api } from "./axios";

export type ChatType = "direct" | "group";

export interface CreateChatPayload {
  type: ChatType;
  title?: string;
  description?: string;
  member_ids?: string[];
}

export interface CreateGroupChatPayload {
  title: string;
  description?: string;
  member_ids?: string[];
}

export interface CreateDirectChatPayload {
  member_ids: string[];
}

export interface ChatMemberPayload {
  user_id: string;
  role?: string;
}

export interface ChatMessagesQuery {
  limit?: number;
  offset?: number;
}

export interface SendMessagePayload {
  text: string;
  attachments?: Array<{
    id?: string;
    url?: string;
    type?: string;
    name?: string;
  }>;
}

export interface ListChatsParams {
  type?: ChatType;
  search?: string;
  limit?: number;
  offset?: number;
}

export const chatsService = {
  createChat: (payload: CreateChatPayload) =>
    api.post("/api/v1/chats", payload),

  createGroupChat: (payload: CreateGroupChatPayload) =>
    api.post("/api/v1/chats", { type: "group", ...payload }),

  createDirectChat: (memberIds: string[]) =>
    api.post("/api/v1/chats", { type: "direct", member_ids: memberIds }),

  listDirectChats: () => api.get("/api/v1/direct-chats"),

  listGroupChats: (params?: ListChatsParams) =>
    api.get("/api/v1/group-chats", { params }),

  addMember: (chatId: string, payload: ChatMemberPayload) =>
    api.post(`/api/v1/chats/${chatId}/members`, payload),

  joinChat: (chatId: string) => api.post(`/api/v1/chats/${chatId}/join`),

  getMessages: (chatId: string, params?: ChatMessagesQuery) =>
    api.get(`/api/v1/group-chats/${chatId}/messages`, { params }),

  leaveChat: (chatId: string) => api.post(`/api/v1/chats/${chatId}/leave`),

  removeMember: (chatId: string, userId: string) =>
    api.delete(`/api/v1/chats/${chatId}/members/${userId}`),

  sendMessage: (chatId: string, payload: SendMessagePayload) =>
    api.post(`/api/v1/chats/${chatId}/messages`, payload),
};
