import { useCallback, useEffect, useState } from "react";
import { chatsService } from "../api";
import type { Chat, ChatMessage } from "../types/chat";
import {
  extractChatList,
  extractMessageList,
  formatChatTime,
  mapChatFromApi,
  mapMessageFromApi,
} from "../utils/chat-utils";

type FetchOptions = {
  silent?: boolean;
};

export const useChatList = (currentUserId: string) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [chatsError, setChatsError] = useState<string | null>(null);

  const requestMessages = useCallback(
    async (chatId: string, chatType: "direct" | "group", limit = 50) => {
      const { data } = await chatsService.getMessages(
        chatId,
        { limit, offset: 0 },
        chatType,
      );
      const list = extractMessageList(data);
      return list
        .map((item) => mapMessageFromApi(item, chatId))
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
    },
    [],
  );

  const updateChatPreview = useCallback(
    (message: ChatMessage) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === message.chatId
            ? {
                ...chat,
                lastMessage: message.text,
                time: formatChatTime(message.createdAt),
              }
            : chat,
        ),
      );
    },
    [],
  );

  const syncParticipantFromMessage = useCallback(
    (message: ChatMessage) => {
      if (!message.senderId) return;
      const hasProfileInfo = Boolean(
        message.senderName || message.senderNickname || message.senderAvatar,
      );
      if (!hasProfileInfo) return;

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== message.chatId) return chat;
          const existing = chat.participants.find(
            (participant) => participant.id === message.senderId,
          );
          if (existing) {
            const nextParticipant = {
              ...existing,
              name: message.senderName ?? existing.name,
              nickname: message.senderNickname ?? existing.nickname,
              avatar: message.senderAvatar ?? existing.avatar,
            };
            if (
              nextParticipant.name === existing.name &&
              nextParticipant.nickname === existing.nickname &&
              nextParticipant.avatar === existing.avatar
            ) {
              return chat;
            }
            return {
              ...chat,
              participants: chat.participants.map((participant) =>
                participant.id === message.senderId
                  ? nextParticipant
                  : participant,
              ),
            };
          }

          return {
            ...chat,
            participants: [
              ...chat.participants,
              {
                id: message.senderId,
                name:
                  message.senderName ?? message.senderNickname ?? "Пользователь",
                nickname: message.senderNickname,
                avatar: message.senderAvatar,
              },
            ],
          };
        }),
      );
    },
    [],
  );

  const fetchLatestMessagePreview = useCallback(
    async (chatId: string, chatType: "direct" | "group") => {
      try {
        const items = await requestMessages(chatId, chatType, 1);
        const last = items[items.length - 1];
        if (last) {
          syncParticipantFromMessage(last);
          updateChatPreview(last);
        }
      } catch (err) {
        console.warn(`Failed to fetch preview for chat ${chatId}`, err);
      }
    },
    [requestMessages, syncParticipantFromMessage, updateChatPreview],
  );

  const fetchChats = useCallback(
    async ({ silent }: FetchOptions = {}) => {
      if (!silent) {
        setChatsLoading(true);
        setChatsError(null);
      }

      try {
        const [directResponse, groupResponse] = await Promise.all([
          chatsService.listDirectChats(),
          chatsService.listGroupChats(),
        ]);
        const directChats = extractChatList(directResponse?.data);
        const groupChats = extractChatList(groupResponse?.data);
        const normalized = [
          ...directChats.map((item) =>
            mapChatFromApi(item, currentUserId, "personal"),
          ),
          ...groupChats.map((item) =>
            mapChatFromApi(item, currentUserId, "group"),
          ),
        ];
        setChats(normalized);
        normalized.forEach((chat) => {
          const chatType = chat.type === "group" ? "group" : "direct";
          void fetchLatestMessagePreview(chat.id, chatType);
        });
      } catch (err) {
        console.error("Failed to load chats", err);
        if (!silent) setChatsError("Не удалось загрузить список чатов");
      } finally {
        if (!silent) setChatsLoading(false);
      }
    },
    [currentUserId, fetchLatestMessagePreview],
  );

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return {
    chats,
    chatsLoading,
    chatsError,
    fetchChats: fetchChats as (options?: FetchOptions) => Promise<void>,
    updateChatPreview,
    syncParticipantFromMessage,
    fetchLatestMessagePreview,
    requestMessages,
  };
};