import { useCallback, useEffect, useRef, useState } from "react";
import { chatsService } from "../api";
import type { Chat, ChatMessage } from "../types/chat";
import {
  CURRENT_USER_ID,
  mapMessageFromApi,
} from "../utils/chat-utils";
import { useChatList } from "./useChatList";
import { useChatSelection } from "./useChatSelection";
import { useMessageCommit } from "./useMessageCommit";
import { useMessagesStore } from "./useMessagesStore";

const MAX_MESSAGE_LENGTH = 512;

type UseChatManagerResult = {
  currentUserId: string;
  chats: Chat[];
  chatsLoading: boolean;
  chatsError: string | null;
  refreshChats: (options?: { silent?: boolean }) => Promise<void>;
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
  threadMessages: ChatMessage[];
  currentThreadRootId: string | null;
  threadMessagesLoading: boolean;
  threadMessagesError: string | null;
  openThread: (rootMessageId: string) => Promise<void>;
  closeThread: () => void;
  threadDraft: string;
  handleThreadDraftChange: (value: string) => void;
  sendThreadMessage: () => Promise<void>;
  isSendingThread: boolean;
};

export const useChatManager = (
  preferredUserId?: string,
): UseChatManagerResult => {
  const currentUserId = preferredUserId ?? CURRENT_USER_ID;

  // Chat list
  const {
    chats,
    chatsLoading,
    chatsError,
    fetchChats,
    updateChatPreview,
    syncParticipantFromMessage,
  } = useChatList(currentUserId);

  // Chat selection
  const {
    selectedChatId,
    selectedChat,
    selectedChatType,
    selectChat: setSelectedId,
    chatTypeFor,
    selectedIdRef,
  } = useChatSelection(chats);

  // Message store
  const resolveActiveChat = useCallback(() => selectedIdRef.current, []);
  const {
    messages,
    replaceMessages,
    upsertMessageForActiveChat,
    removeMessageForActiveChat,
    patchMessageForActiveChat,
    clearMessages,
  } = useMessagesStore(resolveActiveChat);

  // Message commit coordination
  const [typingNotice, setTypingNotice] = useState<string | null>(null);
  const { commitMessage, dropMessage } = useMessageCommit(
    syncParticipantFromMessage,
    upsertMessageForActiveChat,
    updateChatPreview,
    removeMessageForActiveChat,
    setTypingNotice,
    selectedIdRef,
  );

  // Message loading
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const clearMessagesError = useCallback(() => setMessagesError(null), []);

  // Draft / Composition
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);

  // Thread state
  const [threadMessages, setThreadMessages] = useState<ChatMessage[]>([]);
  const [currentThreadRootId, setCurrentThreadRootId] = useState<string | null>(null);
  const [threadDraft, setThreadDraft] = useState("");
  const [isSendingThread, setIsSendingThread] = useState(false);
  const [threadMessagesLoading, setThreadMessagesLoading] = useState(false);
  const [threadMessagesError, setThreadMessagesError] = useState<string | null>(null);
  const currentThreadRootIdRef = useRef<string | null>(null);

  // WebSocket refs
  const wsRef = useRef<WebSocket | null>(null);
  const [wsReady, setWsReady] = useState(false);
  const currentChatRef = useRef<string | null>(null);
  const pendingJoinRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [connectRequested, setConnectRequested] = useState(false);

  // Typing refs
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const typingIndicatorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    currentThreadRootIdRef.current = currentThreadRootId;
  }, [currentThreadRootId]);

  useEffect(() => {
    if (selectedChatId && !chats.some((chat) => chat.id === selectedChatId)) {
      setSelectedId("");
      setTypingNotice(null);
    }
  }, [chats, selectedChatId, setSelectedId]);

  const requestMessages = useCallback(
    async (chatId: string, chatType: "direct" | "group", limit = 50) => {
      const { data } = await chatsService.getMessages(
        chatId,
        { limit, offset: 0 },
        chatType,
      );
      const { extractMessageList } = await import("../utils/chat-utils");
      const list = extractMessageList(data);
      return list
        .map((item: any) => mapMessageFromApi(item, chatId))
        .sort(
          (a: ChatMessage, b: ChatMessage) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
    },
    [],
  );

  // Load messages when chat changes
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

    setCurrentThreadRootId(null);
    currentThreadRootIdRef.current = null;
    setThreadMessages([]);

    let active = true;
    setMessagesLoading(true);
    setMessagesError(null);

    const chatType = selectedChatType ?? "direct";
    requestMessages(selectedChatId, chatType)
      .then((items: ChatMessage[]) => {
        if (!active) return;
        replaceMessages(items);
        items.forEach(syncParticipantFromMessage);
        const last = items[items.length - 1];
        if (last) {
          updateChatPreview(last);
        }
      })
      .catch((err: Error) => {
        if (!active) return;
        console.error(
          `Failed to load messages for chat ${selectedChatId}`,
          err,
        );
        clearMessages();
        setMessagesError("Не удалось загрузить сообщения");
      })
      .finally(() => {
        if (active) setMessagesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    selectedChatId,
    selectedChatType,
    requestMessages,
    clearMessages,
    replaceMessages,
    syncParticipantFromMessage,
    updateChatPreview,
  ]);

  // WebSocket send
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

  // Chat join/leave effect
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

  // WebSocket connection effect
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
              if (message.threadRootId) {
                patchMessageForActiveChat(message.threadRootId, {
                  replyCount: message.replyCount,
                  chatId,
                });
                if (currentThreadRootIdRef.current === message.threadRootId) {
                  setThreadMessages((prev) => {
                    const exists = prev.some((m) => m.id === message.id);
                    if (exists) return prev.map((m) => (m.id === message.id ? message : m));
                    return [...prev, message].sort(
                      (a, b) =>
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                    );
                  });
                }
              } else {
                commitMessage(message);
              }
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
              "Кто-то";
            const systemMessage: ChatMessage = {
              id:
                payload?.event_id ??
                payload?.id ??
                payload?.message_id ??
                `system-${Date.now()}`,
              chatId,
              senderId: leftUserId,
              text: `${leftUserName} вышел из чата`,
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
            ["member_joined", "chat_member_joined", "user_joined"].includes(
              eventType ?? "",
            ) &&
            chatId
          ) {
            const joinedUserId =
              payload?.user_id ??
              payload?.userId ??
              payload?.user?.id ??
              "system";
            const joinedUserName =
              payload?.username ??
              payload?.user_name ??
              payload?.user?.name ??
              payload?.user?.username ??
              "Кто-то";
            const systemMessage: ChatMessage = {
              id:
                payload?.event_id ??
                payload?.id ??
                payload?.message_id ??
                `system-${Date.now()}`,
              chatId,
              senderId: joinedUserId,
              text: `${joinedUserName} присоединился к чату`,
              kind: "system",
              createdAt:
                payload?.timestamp ??
                payload?.created_at ??
                new Date().toISOString(),
              senderName: joinedUserName,
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
              if (typingUserId && typingUserId === currentUserId) {
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
                "Кто-то";

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
                  : `${displayName} печатает...`;
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
  }, [
    connectRequested,
    dropMessage,
    sendWsMessage,
    commitMessage,
    currentUserId,
    patchMessageForActiveChat,
    selectedIdRef,
  ]);

  // Typing indicator effect
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
  }, [draft, selectedChatId, wsReady, sendWsMessage, chatTypeFor, selectedIdRef]);

  useEffect(
    () => () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    },
    [],
  );

  // Draft handlers
  const handleDraftChange = useCallback((value: string) => {
    setDraft(value.slice(0, MAX_MESSAGE_LENGTH));
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
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setMessagesError(
        `Message is too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`,
      );
      return;
    }

    if (attachment) {
      setMessagesError("Отправка файлов пока не поддерживается.");
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
      setMessagesError("Не удалось отправить сообщение");
      setDraft(trimmed);
    } finally {
      setIsSending(false);
    }
  }, [attachment, draft, isSending, sendWsMessage, commitMessage, chatTypeFor, selectedIdRef]);

  // Chat selection wrapper
  const selectChat = useCallback((chatId: string) => {
    pendingJoinRef.current = chatId;
    setSelectedId(chatId);
    setTypingNotice(null);
    setConnectRequested(true);
  }, [setSelectedId]);

  // Thread functions
  const openThread = useCallback(async (rootMessageId: string) => {
    setCurrentThreadRootId(rootMessageId);
    currentThreadRootIdRef.current = rootMessageId;
    setThreadMessagesLoading(true);
    setThreadMessagesError(null);
    setThreadMessages([]);
    setThreadDraft("");

    try {
      const { data } = await chatsService.getThreadMessages(
        selectedIdRef.current!,
        rootMessageId,
      );
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.messages)
          ? data.messages
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.items)
              ? data.items
              : [];
      const mapped = list
        .map((item: any) => mapMessageFromApi(item, selectedIdRef.current!))
        .sort(
          (a: ChatMessage, b: ChatMessage) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      setThreadMessages(mapped);
    } catch (err) {
      console.error("Failed to load thread messages", err);
      setThreadMessagesError("Не удалось загрузить ответы");
    } finally {
      setThreadMessagesLoading(false);
    }
  }, []);

  const closeThread = useCallback(() => {
    setCurrentThreadRootId(null);
    currentThreadRootIdRef.current = null;
    setThreadMessages([]);
    setThreadDraft("");
    setThreadMessagesError(null);
  }, []);

  const handleThreadDraftChange = useCallback((value: string) => {
    setThreadDraft(value.slice(0, MAX_MESSAGE_LENGTH));
  }, []);

  const sendThreadMessage = useCallback(async () => {
    if (!selectedIdRef.current || !currentThreadRootIdRef.current || isSendingThread) return;

    const chatId = selectedIdRef.current;
    const threadRootId = currentThreadRootIdRef.current;
    if (!chatId || !threadRootId) return;

    const trimmed = threadDraft.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setThreadMessagesError(
        `Message is too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`,
      );
      return;
    }

    if (attachment) {
      setThreadMessagesError("Отправка файлов пока не поддерживается.");
      return;
    }

    setIsSendingThread(true);
    setThreadMessagesError(null);
    setThreadDraft("");

    const payload = {
      chat_id: chatId,
      chat_type: "group" as const,
      content: trimmed,
      metadata: { type: "text" },
      thread_root_id: threadRootId,
    };

    const sentViaWs = sendWsMessage("send_message", payload);
    if (sentViaWs) {
      setIsSendingThread(false);
      return;
    }

    try {
      await chatsService.sendMessage(chatId, { text: trimmed });
    } catch (err) {
      console.error("Failed to send thread message", err);
      setThreadMessagesError("Не удалось отправить сообщение");
      setThreadDraft(trimmed);
    } finally {
      setIsSendingThread(false);
    }
  }, [threadDraft, isSendingThread, sendWsMessage, attachment, selectedIdRef]);

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
    currentUserId,
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
    threadMessages,
    currentThreadRootId,
    threadMessagesLoading,
    threadMessagesError,
    openThread,
    closeThread,
    threadDraft,
    handleThreadDraftChange,
    sendThreadMessage,
    isSendingThread,
  };
};