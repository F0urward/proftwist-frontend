import { Chat, ChatMessage, ChatUser } from "../types/chat";

export const CURRENT_USER_ID = "me";

export const initialsFrom = (value: string): string =>
  value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? "")
    .join("") || "U";

const randomId = () => Math.random().toString(36).slice(2, 10);

export const ensureString = (value: unknown, fallback: string): string => {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
};

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const formatChatTime = (value: unknown): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : undefined;
  }
  const now = new Date();
  if (sameDay(date, now)) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString();
};

export const FALLBACK_USER: ChatUser = { id: "unknown", name: "User" };

export const mapUserFromApi = (user: any): ChatUser => {
  if (!user || typeof user !== "object") {
    return { id: `user-${randomId()}`, name: "User" };
  }

  const id = ensureString(
    user.id ?? user.user_id ?? user.uuid,
    `user-${randomId()}`,
  );
  const nameSource =
    user.name ?? user.username ?? user.full_name ?? user.email ?? "User";

  return {
    id,
    name: ensureString(nameSource, "User"),
    nickname: user.nickname ?? user.username ?? user.display_name ?? undefined,
    avatar: user.avatar ?? user.avatar_url ?? user.image ?? undefined,
  };
};

export const mapChatFromApi = (chat: any, currentUserId: string): Chat => {
  const participantsSource = Array.isArray(chat?.participants)
    ? chat.participants
    : Array.isArray(chat?.members)
    ? chat.members
    : [];

  const chatType: "group" | "personal" =
    chat?.type === "group" || chat?.kind === "group" ? "group" : "personal";

  const lastMessage =
    typeof chat?.last_message === "string"
      ? chat.last_message
      : chat?.last_message?.text ??
        chat?.last_message?.content ??
        chat?.last_message?.message ??
        chat?.lastMessage ??
        undefined;

  const timestamp =
    chat?.last_message?.created_at ??
    chat?.last_message?.createdAt ??
    chat?.updated_at ??
    chat?.updatedAt ??
    chat?.created_at ??
    chat?.createdAt;

  const unreadCount =
    typeof chat?.unread_count === "number"
      ? chat.unread_count
      : typeof chat?.unread === "number"
      ? chat.unread
      : undefined;

  const participants = participantsSource.map(mapUserFromApi);
  if (!participants.some((participant) => participant.id === currentUserId)) {
    participants.push({ id: currentUserId, name: "You" });
  }

  return {
    id: ensureString(
      chat?.id ?? chat?.chat_id ?? chat?.uuid,
      `chat-${randomId()}`,
    ),
    title: ensureString(
      chat?.title ?? chat?.name ?? chat?.topic,
      chatType === "group" ? "Group chat" : "Personal chat",
    ),
    type: chatType,
    participants,
    groupAvatar:
      chat?.group_avatar ?? chat?.avatar ?? chat?.image ?? undefined,
    lastMessage,
    time: formatChatTime(timestamp),
    unread: unreadCount,
  };
};

export const mapMessageFromApi = (
  message: any,
  fallbackChatId: string,
): ChatMessage => {
  const id = ensureString(
    message?.id ?? message?.message_id ?? message?.uuid,
    `msg-${randomId()}`,
  );

  const senderSource = message?.sender ?? message?.author ?? message?.user;
  const senderId = ensureString(
    senderSource?.id ??
      senderSource?.user_id ??
      message?.sender_id ??
      message?.user_id,
    "unknown",
  );

  const text = ensureString(
    message?.text ?? message?.content ?? message?.message ?? "",
    "",
  );

  const chatId = ensureString(
    message?.chat_id ?? message?.chatId ?? message?.chat?.id,
    fallbackChatId,
  );

  const rawTimestamp =
    message?.created_at ??
    message?.createdAt ??
    message?.timestamp ??
    message?.sent_at ??
    message?.sentAt ??
    new Date().toISOString();

  const parsed = new Date(rawTimestamp);
  const createdAt = Number.isNaN(parsed.getTime())
    ? new Date().toISOString()
    : parsed.toISOString();

  return {
    id,
    chatId,
    senderId,
    text,
    createdAt,
  };
};

export const extractChatList = (payload: unknown): any[] => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const candidates = [
    (payload as any).chats,
    (payload as any).data,
    (payload as any).items,
    (payload as any).results,
    (payload as any).list,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
};

export const extractMessageList = (payload: unknown): any[] => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const root = payload as any;
  const candidates = [
    root.messages,
    root.chat_messages,
    root.data,
    root.data?.messages,
    root.data?.chat_messages,
    root.items,
    root.results,
    root.list,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
};

export const getOtherUser = (chat: Chat, meId: string): ChatUser =>
  chat.participants.find((participant) => participant.id !== meId) ??
  chat.participants[0] ??
  FALLBACK_USER;

export const getChatAvatar = (
  chat: Chat,
  meId: string,
):
  | { alt: string; initials: string }
  | { src: string; alt: string; initials: string } => {
  if (chat.type === "group") {
    const alt = chat.title || "Group";
    const initials = initialsFrom(alt);
    if (chat.groupAvatar && chat.groupAvatar.length > 0) {
      return { src: chat.groupAvatar, alt, initials };
    }
    return { alt, initials };
  }

  const other = getOtherUser(chat, meId);
  const alt = other.name || other.nickname || "User";
  const initials = initialsFrom(alt);
  if (other.avatar && other.avatar.length > 0) {
    return { src: other.avatar, alt, initials };
  }
  return { alt, initials };
};
