import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { chatsService } from "../api";
import type { Chat, ChatMessage } from "../types/chat";
import {
  CURRENT_USER_ID,
  extractChatList,
  extractMessageList,
  formatChatTime,
  mapChatFromApi,
  mapMessageFromApi,
} from "../utils/chat-utils";

type ActiveChatResolver = () => string | null;

const sortMessagesByDate = (items: ChatMessage[]): ChatMessage[] =>
  [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

const useMessagesStore = (resolveActiveChat: ActiveChatResolver) => {
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

  const clearMessages = useCallback(() => setMessages([]), []);

  return {
    messages,
    replaceMessages,
    upsertMessageForActiveChat,
    removeMessageForActiveChat,
    clearMessages,
  };
};

type FetchOptions = {
  silent?: boolean;
};

type UseChatManagerResult = {
  currentUserId: string;
  chats: Chat[];
  chatsLoading: boolean;
  chatsError: string | null;
  refreshChats: (options?: FetchOptions) => Promise<void>;
  selectedChat: Chat | null;
  selectedChatId: string | null;
  selectChat: (chatId: string) => void;
  messages: ChatMessage[];
  messagesLoading: boolean;
  messagesError: string | null;
  clearMessagesError: () => void;
  draft: string;
  handleDraftChange: (value: string) => void;
  sendMessage: () => Promise<void>;
  isSending: boolean;
  attachment: File | null;
  pickAttachment: (file: File | null) => void;
  clearAttachment: () => void;
  typingNotice: string | null;
  closeConnection: () => void;
};

export const useChatManager = (): UseChatManagerResult => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [chatsError, setChatsError] = useState<string | null>(null);

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const [wsReady, setWsReady] = useState(false);
  const selectedIdRef = useRef<string | null>(null);
  const chatTypeFor = useCallback(
    (chatId: string | null): "direct" | "group" => {
      if (!chatId) return "direct";
      const chat = chats.find((item) => item.id === chatId);
      return chat?.type === "group" ? "group" : "direct";
    },
    [chats],
  );
  const resolveActiveChat = useCallback(() => selectedIdRef.current, []);
  const {
    messages,
    replaceMessages,
    upsertMessageForActiveChat,
    removeMessageForActiveChat,
    clearMessages,
  } = useMessagesStore(resolveActiveChat);
  const currentChatRef = useRef<string | null>(null);
  const pendingJoinRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const [connectRequested, setConnectRequested] = useState(false);
  const typingIndicatorTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [typingNotice, setTypingNotice] = useState<string | null>(null);

  const clearMessagesError = useCallback(() => setMessagesError(null), []);

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
    [setChats],
  );

  const syncParticipantFromMessage = useCallback((message: ChatMessage) => {
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
              name: message.senderName ?? message.senderNickname ?? "User",
              nickname: message.senderNickname,
              avatar: message.senderAvatar,
            },
          ],
        };
      }),
    );
  }, []);

  const commitMessage = useCallback(
    (message: ChatMessage) => {
      syncParticipantFromMessage(message);
      upsertMessageForActiveChat(message);
      updateChatPreview(message);
      if (selectedIdRef.current === message.chatId) {
        setTypingNotice(null);
      }
    },
    [syncParticipantFromMessage, upsertMessageForActiveChat, updateChatPreview],
  );

  const dropMessage = useCallback(
    (chatId: string, messageId: string) => {
      removeMessageForActiveChat(chatId, messageId);
    },
    [removeMessageForActiveChat],
  );

  const sendWsMessage = useCallback((type: string, data: unknown) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;

    try {
      ws.send(
        JSON.stringify({
          type,
          data,
          timestamp: new Date().toISOString(),
        }),
      );
      return true;
    } catch (err) {
      console.error("Failed to send WS message", err);
      return false;
    }
  }, []);

  const requestMessages = useCallback(
    async (chatId: string, limit = 50) => {
      const { data } = await chatsService.getMessages(chatId, {
        limit,
        offset: 0,
      });
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

  const fetchLatestMessagePreview = useCallback(
    async (chatId: string) => {
      try {
        const items = await requestMessages(chatId, 1);
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

  const fetchChats = useCallback(async ({ silent }: FetchOptions = {}) => {
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
          mapChatFromApi(item, CURRENT_USER_ID, "personal"),
        ),
        ...groupChats.map((item) =>
          mapChatFromApi(item, CURRENT_USER_ID, "group"),
        ),
      ];
      setChats(normalized);
      normalized.forEach((chat) => {
        void fetchLatestMessagePreview(chat.id);
      });
    } catch (err) {
      console.error("Failed to load chats", err);
      if (!silent) setChatsError("Failed to load chats");
    } finally {
      if (!silent) setChatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (selectedChatId && !chats.some((chat) => chat.id === selectedChatId)) {
      setSelectedChatId(null);
      setTypingNotice(null);
    }
  }, [chats, selectedChatId]);

  useEffect(() => {
    selectedIdRef.current = selectedChatId;
  }, [selectedChatId]);

  useEffect(() => {
    if (!selectedChatId) {
      clearMessages();
      setMessagesLoading(false);
      setMessagesError(null);
      setDraft("");
      setAttachment(null);
      setTypingNotice(null);
      return;
    }

    let active = true;
    setMessagesLoading(true);
    setMessagesError(null);

    requestMessages(selectedChatId)
      .then((items) => {
        if (!active) return;
        replaceMessages(items);
        items.forEach(syncParticipantFromMessage);
        const last = items[items.length - 1];
        if (last) {
          updateChatPreview(last);
        }
      })
      .catch((err) => {
        if (!active) return;
        console.error(
          `Failed to load messages for chat ${selectedChatId}`,
          err,
        );
        clearMessages();
        setMessagesError("Failed to load messages");
      })
      .finally(() => {
        if (active) setMessagesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    selectedChatId,
    requestMessages,
    clearMessages,
    replaceMessages,
    syncParticipantFromMessage,
    updateChatPreview,
  ]);

  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (!selectedChatId) {
      if (typingIndicatorTimeoutRef.current) {
        clearTimeout(typingIndicatorTimeoutRef.current);
        typingIndicatorTimeoutRef.current = null;
      }
      setTypingNotice(null);
      if (wsReady && currentChatRef.current) {
        sendWsMessage("leave", { chat_id: currentChatRef.current });
      }
      currentChatRef.current = null;
      pendingJoinRef.current = null;
      isTypingRef.current = false;
      return;
    }

    const ws = wsRef.current;
    if (!wsReady || !ws || ws.readyState !== WebSocket.OPEN) {
      pendingJoinRef.current = selectedChatId;
      return;
    }

    if (currentChatRef.current && currentChatRef.current !== selectedChatId) {
      sendWsMessage("leave", { chat_id: currentChatRef.current });
    }

    if (currentChatRef.current !== selectedChatId) {
      sendWsMessage("join", { chat_id: selectedChatId });
      currentChatRef.current = selectedChatId;
      pendingJoinRef.current = null;
    }
  }, [selectedChatId, wsReady, sendWsMessage]);

  useEffect(() => {
    if (!connectRequested) return;

    let shouldReconnect = true;

    const connect = () => {
      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const wsUrl = `${protocol}://${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsReady(true);
        const targetChat =
          pendingJoinRef.current ??
          currentChatRef.current ??
          selectedIdRef.current;
        if (targetChat) {
          sendWsMessage("join", { chat_id: targetChat });
          currentChatRef.current = targetChat;
          pendingJoinRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const eventType = parsed?.type ?? parsed?.event;
          const payload =
            parsed?.data ?? parsed?.payload ?? parsed?.message ?? parsed;

          const chatId =
            payload?.chat_id ??
            payload?.chatId ??
            payload?.chat?.id ??
            parsed?.chat_id ??
            parsed?.chatId ??
            null;

          if (eventType === "message_sent" || eventType === "message_updated") {
            if (chatId) {
              const message = mapMessageFromApi(payload, chatId);
              commitMessage(message);
            }
          } else if (eventType === "message_deleted") {
            if (chatId && payload?.message_id) {
              dropMessage(chatId, payload.message_id);
            }
          } else if (
            ["member_left", "chat_member_left", "user_left"].includes(
              eventType ?? "",
            ) &&
            chatId
          ) {
            const leftUserId =
              payload?.user_id ??
              payload?.userId ??
              payload?.user?.id ??
              "system";
            const leftUserName =
              payload?.username ??
              payload?.user_name ??
              payload?.user?.name ??
              payload?.user?.username ??
              "Someone";
            const systemMessage: ChatMessage = {
              id:
                payload?.event_id ??
                payload?.id ??
                payload?.message_id ??
                `system-${Date.now()}`,
              chatId,
              senderId: leftUserId,
              text: `${leftUserName} left the chat`,
              kind: "system",
              createdAt:
                payload?.timestamp ??
                payload?.created_at ??
                new Date().toISOString(),
              senderName: leftUserName,
              senderNickname: payload?.username ?? payload?.user_name,
              senderAvatar: payload?.avatar_url ?? payload?.user?.avatar_url,
            };
            commitMessage(systemMessage);
          } else if (
            (eventType === "typing" || eventType === "typing_notification") &&
            chatId
          ) {
            if (selectedIdRef.current === chatId) {
              const typingPayload = payload;
              let typedMessage: string | null = null;
              if (typeof typingPayload === "string") {
                typedMessage = typingPayload;
              } else if (typeof typingPayload?.message === "string") {
                typedMessage = typingPayload.message;
              } else if (typeof typingPayload?.text === "string") {
                typedMessage = typingPayload.text;
              } else if (typeof typingPayload?.content === "string") {
                typedMessage = typingPayload.content;
              }
              let typingFlag: boolean | null = null;
              if (typeof typingPayload === "object" && typingPayload !== null) {
                if (typeof typingPayload.typing === "boolean") {
                  typingFlag = typingPayload.typing;
                } else if (typeof typingPayload.is_typing === "boolean") {
                  typingFlag = typingPayload.is_typing;
                } else if (typeof typingPayload.status === "string") {
                  const status = typingPayload.status.toLowerCase();
                  if (["start", "started", "typing"].includes(status)) {
                    typingFlag = true;
                  } else if (["stop", "stopped", "idle"].includes(status)) {
                    typingFlag = false;
                  }
                }
              }

              const typingUserId =
                typingPayload?.user_id ??
                typingPayload?.userId ??
                typingPayload?.user?.id ??
                null;
              if (typingUserId && typingUserId === CURRENT_USER_ID) {
                return;
              }

              const displayName =
                typingPayload?.username ??
                typingPayload?.user_name ??
                typingPayload?.user?.name ??
                typingPayload?.user?.username ??
                typingPayload?.user_name ??
                typingPayload?.user_id ??
                typingPayload?.userId ??
                "Someone";

              if (typingIndicatorTimeoutRef.current) {
                clearTimeout(typingIndicatorTimeoutRef.current);
                typingIndicatorTimeoutRef.current = null;
              }

              if (typingFlag === false) {
                setTypingNotice(null);
                return;
              }

              if (typingFlag === true || typedMessage) {
                const notice = typedMessage
                  ? `${displayName}: ${typedMessage}`
                  : `${displayName} is typing...`;
                setTypingNotice(notice);
                typingIndicatorTimeoutRef.current = setTimeout(() => {
                  setTypingNotice(null);
                  typingIndicatorTimeoutRef.current = null;
                }, 3000);
              }
            }
          } else if (eventType === "pong" || eventType === "ping") {
            // ignore heartbeats
          }
        } catch (err) {
          console.error("Failed to handle ws message", err);
        }
      };

      ws.onclose = () => {
        setWsReady(false);
        wsRef.current = null;
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        if (shouldReconnect) {
          pendingJoinRef.current = selectedIdRef.current ?? null;
          currentChatRef.current = null;
          reconnectTimeoutRef.current = setTimeout(connect, 2000);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error", err);
        ws.close();
      };
    };

    connect();

    return () => {
      shouldReconnect = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        if (currentChatRef.current) {
          ws.send(
            JSON.stringify({
              type: "leave",
              data: { chat_id: currentChatRef.current },
              timestamp: new Date().toISOString(),
            }),
          );
        }
        ws.close();
      }
      wsRef.current = null;
      currentChatRef.current = null;
      pendingJoinRef.current = null;
      setWsReady(false);
      setTypingNotice(null);
    };
  }, [connectRequested, dropMessage, sendWsMessage, commitMessage]);

  useEffect(() => {
    const trimmed = draft.trim();

    if (!selectedChatId || !wsReady) {
      if (isTypingRef.current && selectedChatId) {
        sendWsMessage("typing", {
          chat_id: selectedChatId,
          chat_type: chatTypeFor(selectedChatId),
          typing: false,
        });
        isTypingRef.current = false;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      return;
    }

    if (trimmed.length === 0) {
      if (isTypingRef.current) {
        sendWsMessage("typing", {
          chat_id: selectedChatId,
          chat_type: chatTypeFor(selectedChatId),
          typing: false,
        });
        isTypingRef.current = false;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      return;
    }

    if (!isTypingRef.current) {
      sendWsMessage("typing", {
        chat_id: selectedChatId,
        chat_type: chatTypeFor(selectedChatId),
        typing: true,
      });
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current && selectedIdRef.current) {
        sendWsMessage("typing", {
          chat_id: selectedIdRef.current,
          chat_type: chatTypeFor(selectedIdRef.current),
          typing: false,
        });
        isTypingRef.current = false;
      }
    }, 2000);
  }, [draft, selectedChatId, wsReady, sendWsMessage, chatTypeFor]);

  useEffect(
    () => () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    },
    [],
  );

  const handleDraftChange = useCallback((value: string) => {
    setDraft(value);
    setMessagesError(null);
  }, []);

  const pickAttachment = useCallback((file: File | null) => {
    setAttachment(file);
    setMessagesError(null);
  }, []);

  const clearAttachment = useCallback(() => {
    setAttachment(null);
    setMessagesError(null);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!selectedIdRef.current || isSending) return;

    const chatId = selectedIdRef.current;
    if (!chatId) return;

    const trimmed = draft.trim();
    if (!trimmed) return;

    if (attachment) {
      setMessagesError("File attachments are not supported yet.");
      return;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (isTypingRef.current && selectedIdRef.current) {
      sendWsMessage("typing", {
        chat_id: selectedIdRef.current,
        chat_type: chatTypeFor(selectedIdRef.current),
        typing: false,
      });
      isTypingRef.current = false;
    }

    setIsSending(true);
    setMessagesError(null);
    setDraft("");

    const payload = {
      chat_id: chatId,
      chat_type: chatTypeFor(chatId),
      content: trimmed,
      metadata: { type: "text" },
    };

    const sentViaWs = sendWsMessage("send_message", payload);
    if (sentViaWs) {
      setAttachment(null);
      setIsSending(false);
      return;
    }

    try {
      const { data } = await chatsService.sendMessage(chatId, {
        text: trimmed,
      });
      const messageSource = data?.message ?? data;
      if (messageSource) {
        const message = mapMessageFromApi(messageSource, chatId);
        commitMessage(message);
      }
      setAttachment(null);
    } catch (err) {
      console.error("Failed to send message", err);
      setMessagesError("Failed to send message");
      setDraft(trimmed);
    } finally {
      setIsSending(false);
    }
  }, [attachment, draft, isSending, sendWsMessage, commitMessage, chatTypeFor]);

  const selectChat = useCallback((chatId: string) => {
    pendingJoinRef.current = chatId;
    setSelectedChatId(chatId);
    setTypingNotice(null);
    setConnectRequested(true);
  }, []);

  const selectedChat = useMemo(
    () => chats.find((chat) => chat.id === selectedChatId) ?? null,
    [chats, selectedChatId],
  );

  const closeConnection = useCallback(() => {
    const ws = wsRef.current;
    if (ws) {
      ws.close();
    }
    wsRef.current = null;
    setWsReady(false);
    currentChatRef.current = null;
    pendingJoinRef.current = null;
  }, []);

  return {
    currentUserId: CURRENT_USER_ID,
    chats,
    chatsLoading,
    chatsError,
    refreshChats: fetchChats,
    selectedChat,
    selectedChatId,
    selectChat,
    messages,
    messagesLoading,
    messagesError,
    clearMessagesError,
    draft,
    handleDraftChange,
    sendMessage,
    isSending,
    attachment,
    pickAttachment,
    clearAttachment,
    typingNotice,
    closeConnection,
  };
};
