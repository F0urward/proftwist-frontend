import { api } from "./axios";

export interface FriendSummary {
  user_id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  online?: boolean;
  expertise?: string;
  focus?: string;
  shared_roadmaps?: number;
  chat_id?: string;
  [key: string]: unknown;
}

export interface FriendListResponse {
  friends: FriendSummary[];
  [key: string]: unknown;
}

export interface FriendRequestSummary {
  id: string;
  from_user_id?: string;
  to_user_id?: string;
  message?: string;
  status?: string;
  direction?: "sent" | "received";
  created_at?: string;
  [key: string]: unknown;
}

export interface FriendRequestsResponse {
  received: FriendRequestSummary[];
  sent: FriendRequestSummary[];
  [key: string]: unknown;
}

export interface CreateFriendRequestPayload {
  target_user_id: string;
  message?: string;
}

export const friendsService = {
  listFriends: () => api.get<FriendListResponse>("/friends"),

  deleteFriend: (friendId: string) => api.delete(`/friends/${friendId}`),

  listFriendRequests: () =>
    api.get<FriendRequestsResponse>("/friend-requests"),

  acceptFriendRequest: (requestId: string) =>
    api.post(`/friend-requests/${requestId}/accept`),

  deleteFriendRequest: (requestId: string) =>
    api.delete(`/friend-requests/${requestId}`),

  createFriendRequest: (payload: CreateFriendRequestPayload) =>
    api.post("/friend-requests", payload),

  createOrGetChat: (friendId: string) =>
    api.post<{ chat_id: string }>(`/friends/${friendId}/chat`),
};
