export type ChatUser = {
  id: string;
  name: string;
  nickname?: string;
  avatar?: string;
};

export type Chat = {
  id: string;
  title: string;
  type: "personal" | "group";
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
  createdAt: string;
  senderName?: string;
  senderNickname?: string;
  senderAvatar?: string;
};
