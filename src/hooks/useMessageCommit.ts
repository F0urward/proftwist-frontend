import { useCallback } from "react";
import type { ChatMessage } from "../types/chat";

export const useMessageCommit = (
  syncParticipantFromMessage: (message: ChatMessage) => void,
  upsertMessageForActiveChat: (message: ChatMessage) => void,
  updateChatPreview: (message: ChatMessage) => void,
  removeMessageForActiveChat: (chatId: string, messageId: string) => void,
  setTypingNotice: (notice: string | null) => void,
  selectedIdRef: React.MutableRefObject<string | null>,
) => {
  const commitMessage = useCallback(
    (message: ChatMessage) => {
      syncParticipantFromMessage(message);
      upsertMessageForActiveChat(message);
      updateChatPreview(message);
      if (selectedIdRef.current === message.chatId) {
        setTypingNotice(null);
      }
    },
    [syncParticipantFromMessage, upsertMessageForActiveChat, updateChatPreview, selectedIdRef, setTypingNotice],
  );

  const dropMessage = useCallback(
    (chatId: string, messageId: string) => {
      removeMessageForActiveChat(chatId, messageId);
    },
    [removeMessageForActiveChat],
  );

  return { commitMessage, dropMessage };
};