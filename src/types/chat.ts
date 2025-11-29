export type FriendshipStatusValue = "pending" | "accepted" | "rejected";

export type FriendshipStatus = {
  status: FriendshipStatusValue;
  isSender?: boolean;
};

export type ChatUser = {
  id: string;
  name: string;
  nickname?: string;
  avatar?: string;
  isCurrentUser?: boolean;
  originalId?: string;
  friendshipStatus?: FriendshipStatus;
};

export type Chat = {
  id: string;
  title: string;
  type: "direct" | "group";
  participants: ChatUser[];
  groupAvatar?: string;
  lastMessage?: string;
  time?: string;
  unread?: number;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  kind?: "text" | "system";
  createdAt: string;
  senderName?: string;
  senderNickname?: string;
  senderAvatar?: string;
};
