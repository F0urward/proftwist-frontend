import { useCallback, useState } from "react";
import type { ChatMessage } from "../types/chat";
import { sortMessagesByDate } from "../utils/chat-utils";

type ActiveChatResolver = () => string | null;

export const useMessagesStore = (resolveActiveChat: ActiveChatResolver) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const replaceMessages = useCallback((incoming: ChatMessage[]) => {
    setMessages(sortMessagesByDate(incoming));
  }, []);

  const upsertMessageForActiveChat = useCallback(
    (message: ChatMessage) => {
      setMessages((prev) => {
        if (resolveActiveChat() !== message.chatId) return prev;
        const exists = prev.some((item) => item.id === message.id);
        const next = exists
          ? prev.map((item) => (item.id === message.id ? message : item))
          : [...prev, message];
        return sortMessagesByDate(next);
      });
    },
    [resolveActiveChat],
  );

  const removeMessageForActiveChat = useCallback(
    (chatId: string, messageId: string) => {
      setMessages((prev) => {
        if (resolveActiveChat() !== chatId) return prev;
        return prev.filter((item) => item.id !== messageId);
      });
    },
    [resolveActiveChat],
  );

  const patchMessageForActiveChat = useCallback(
    (messageId: string, patch: Record<string, unknown>) => {
      setMessages((prev) => {
        if (resolveActiveChat() !== patch.chatId) return prev;
        return prev.map((m) =>
          m.id === messageId ? { ...m, ...patch as Partial<ChatMessage> } : m,
        );
      });
    },
    [resolveActiveChat],
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return {
    messages,
    replaceMessages,
    upsertMessageForActiveChat,
    removeMessageForActiveChat,
    patchMessageForActiveChat,
    clearMessages,
  };
};