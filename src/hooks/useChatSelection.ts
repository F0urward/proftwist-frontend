import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Chat } from "../types/chat";

export const useChatSelection = (chats: Chat[]) => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  const chatTypeFor = useCallback(
    (chatId: string | null): "direct" | "group" => {
      if (!chatId) return "direct";
      const chat = chats.find((item) => item.id === chatId);
      return chat?.type === "group" ? "group" : "direct";
    },
    [chats],
  );

  const selectedChat = useMemo(
    () => chats.find((chat) => chat.id === selectedChatId) ?? null,
    [chats, selectedChatId],
  );

  const selectedChatType: "direct" | "group" | null = selectedChat
    ? selectedChat.type === "group"
      ? "group"
      : "direct"
    : null;

  useEffect(() => {
    selectedIdRef.current = selectedChatId;
  }, [selectedChatId]);

  const selectChat = useCallback((chatId: string) => {
    setSelectedChatId(chatId);
  }, []);

  return {
    selectedChatId,
    selectedChat,
    selectedChatType,
    selectChat,
    chatTypeFor,
    selectedIdRef,
  };
};