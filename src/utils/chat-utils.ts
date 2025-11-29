import { Chat, ChatMessage, ChatUser } from "../types/chat";

export const CURRENT_USER_ID = "me";

const randomId = () => Math.random().toString(36).slice(2, 10);

const toNonEmptyString = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
};

const optionalString = (value: unknown): string | undefined =>
  toNonEmptyString(value) ?? undefined;

const pickFirstDefined = <T>(
  ...values: Array<T | null | undefined>
): T | undefined => {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
};

const readPath = (root: any, path: string[]) =>
  path.reduce<unknown>(
    (acc, key) =>
      acc && typeof acc === "object"
        ? (acc as Record<string, unknown>)[key]
        : undefined,
    root,
  );

const extractListFromPayload = (
  payload: unknown,
  candidatePaths: string[][],
): any[] => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  for (const path of candidatePaths) {
    const candidate = readPath(payload, path);
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
};

export const ensureString = (value: unknown, fallback: string): string =>
  toNonEmptyString(value) ?? fallback;

const normalizeFriendshipStatus = (
  value: unknown,
): ChatUser["friendshipStatus"] => {
  if (!value) return undefined;

  if (typeof value === "boolean") {
    return value ? { status: "accepted" } : undefined;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "accepted" || normalized === "friend") {
      return { status: "accepted" };
    }
    if (
      normalized === "pending" ||
      normalized === "sent" ||
      normalized === "requested" ||
      normalized === "request_sent" ||
      normalized === "waiting"
    ) {
      return { status: "pending" };
    }
    if (normalized === "rejected" || normalized === "declined") {
      return { status: "rejected" };
    }
    return undefined;
  }

  if (typeof value === "object") {
    const rawStatus = optionalString(
      (value as any).status ??
        (value as any).state ??
        (value as any).value ??
        (value as any).friend_status,
    );
    const isSender =
      typeof (value as any).is_sender === "boolean"
        ? (value as any).is_sender
        : typeof (value as any).isSender === "boolean"
          ? (value as any).isSender
          : undefined;

    if (!rawStatus) return undefined;
    const normalized = rawStatus.trim().toLowerCase();

    if (normalized === "accepted" || normalized === "friend") {
      return { status: "accepted", isSender };
    }
    if (
      normalized === "pending" ||
      normalized === "sent" ||
      normalized === "requested" ||
      normalized === "request_sent" ||
      normalized === "waiting"
    ) {
      return { status: "pending", isSender };
    }
    if (normalized === "rejected" || normalized === "declined") {
      return { status: "rejected", isSender };
    }
  }

  return undefined;
};

export const initialsFrom = (value: string): string =>
  value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? "")
    .join("") || "U";

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
    pickFirstDefined(user.id, user.user_id, user.uuid),
    `user-${randomId()}`,
  );
  const nameSource = pickFirstDefined(
    user.name,
    user.username,
    user.full_name,
    user.email,
  );

  return {
    id,
    name: ensureString(nameSource, "User"),
    nickname: optionalString(
      user.nickname ?? user.username ?? user.display_name,
    ),
    avatar: optionalString(user.avatar ?? user.avatar_url ?? user.image),
    friendshipStatus:
      normalizeFriendshipStatus(
        user.friendship_status ??
          user.friend_status ??
          user.friendshipStatus ??
          user.friendship ??
          user.friendStatus ??
          user.friendship_state ??
          user.friendshipState,
      ) ??
      normalizeFriendshipStatus(
        typeof user.is_friend === "boolean" ? user.is_friend : undefined,
      ),
  };
};

export const mapChatFromApi = (
  chat: any,
  currentUserId: string,
  preferredType?: "personal" | "group",
): Chat => {
  const participantsSource = Array.isArray(chat?.participants)
    ? chat.participants
    : Array.isArray(chat?.members)
      ? chat.members
      : [];

  const chatType: "group" | "personal" =
    preferredType ??
    (chat?.type === "group" || chat?.kind === "group" ? "group" : "personal");

  const messageMeta =
    typeof chat?.last_message === "object" ? chat.last_message : null;
  const lastMessageSource =
    typeof chat?.last_message === "string"
      ? chat.last_message
      : pickFirstDefined(
          messageMeta?.text,
          messageMeta?.content,
          messageMeta?.message,
          chat?.lastMessage,
        );

  const timestampSource = pickFirstDefined(
    messageMeta?.created_at,
    messageMeta?.createdAt,
    chat?.updated_at,
    chat?.updatedAt,
    chat?.created_at,
    chat?.createdAt,
  );

  const unreadCount = pickFirstDefined(
    typeof chat?.unread_count === "number" ? chat.unread_count : undefined,
    typeof chat?.unread === "number" ? chat.unread : undefined,
  );

  const participants = participantsSource.map(mapUserFromApi);
  if (!participants.some((participant) => participant.id === currentUserId)) {
    participants.push({ id: currentUserId, name: "You" });
  }

  const companion =
    chatType === "personal"
      ? participants.find((participant) => participant.id !== currentUserId)
      : undefined;
  const personalTitleFallback =
    companion?.name ?? companion?.nickname ?? undefined;

  const fallbackTitle =
    chatType === "group" ? "Group chat" : personalTitleFallback ?? "Personal chat";

  return {
    id: ensureString(
      pickFirstDefined(chat?.id, chat?.chat_id, chat?.uuid),
      `chat-${randomId()}`,
    ),
    title: ensureString(
      pickFirstDefined(
        chat?.title,
        chat?.name,
        chat?.topic,
        personalTitleFallback,
      ),
      fallbackTitle,
    ),
    type: chatType,
    participants,
    groupAvatar: optionalString(
      chat?.group_avatar ?? chat?.avatar ?? chat?.image,
    ),
    lastMessage: optionalString(lastMessageSource),
    time: formatChatTime(timestampSource),
    unread: unreadCount,
  };
};

export const mapMessageFromApi = (
  message: any,
  fallbackChatId: string,
): ChatMessage => {
  const senderSource = message?.sender ?? message?.author ?? message?.user;

  const senderId = ensureString(
    pickFirstDefined(
      senderSource?.id,
      senderSource?.user_id,
      message?.sender_id,
      message?.user_id,
    ),
    "unknown",
  );

  const text = ensureString(
    pickFirstDefined(message?.text, message?.content, message?.message),
    "",
  );

  const senderName = optionalString(
    pickFirstDefined(
      senderSource?.name,
      senderSource?.full_name,
      senderSource?.display_name,
      message?.user_name,
      message?.username,
    ),
  );

  const senderNickname = optionalString(
    pickFirstDefined(
      senderSource?.nickname,
      senderSource?.username,
      message?.username,
      message?.user_name,
    ),
  );

  const senderAvatar = optionalString(
    pickFirstDefined(
      senderSource?.avatar,
      senderSource?.avatar_url,
      senderSource?.image,
      message?.avatar_url,
      message?.avatar,
    ),
  );

  const chatId = ensureString(
    pickFirstDefined(message?.chat_id, message?.chatId, message?.chat?.id),
    fallbackChatId,
  );

  const rawTimestamp = pickFirstDefined(
    message?.created_at,
    message?.createdAt,
    message?.timestamp,
    message?.sent_at,
    message?.sentAt,
  );

  const parsed = rawTimestamp ? new Date(rawTimestamp) : new Date();
  const createdAt = Number.isNaN(parsed.getTime())
    ? new Date().toISOString()
    : parsed.toISOString();

  return {
    id: ensureString(
      pickFirstDefined(message?.id, message?.message_id, message?.uuid),
      `msg-${randomId()}`,
    ),
    chatId,
    senderId,
    text,
    createdAt,
    senderName,
    senderNickname,
    senderAvatar,
  };
};

export const extractChatList = (payload: unknown): any[] =>
  extractListFromPayload(payload, [
    ["chats"],
    ["data"],
    ["items"],
    ["group_chats"],
    ["direct_chats"],
    ["list"],
  ]);

export const extractMessageList = (payload: unknown): any[] =>
  extractListFromPayload(payload, [
    ["messages"],
    ["chat_messages"],
    ["data"],
    ["data", "messages"],
    ["data", "chat_messages"],
    ["items"],
    ["results"],
    ["list"],
  ]);

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
