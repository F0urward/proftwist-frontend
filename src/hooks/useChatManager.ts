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
};

export const useChatManager = (): UseChatManagerResult => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [chatsError, setChatsError] = useState<string | null>(null);

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const [wsReady, setWsReady] = useState(false);
  const selectedIdRef = useRef<string | null>(null);
  const currentChatRef = useRef<string | null>(null);
  const pendingJoinRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const [connectRequested, setConnectRequested] = useState(false);

  const clearMessagesError = useCallback(() => setMessagesError(null), []);

  const upsertMessage = useCallback(
    (message: ChatMessage) => {
      setMessages((prev) => {
        if (selectedIdRef.current !== message.chatId) return prev;
        const exists = prev.some((item) => item.id === message.id);
        const next = exists
          ? prev.map((item) => (item.id === message.id ? message : item))
          : [...prev, message];
        return next.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime(),
        );
      });
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

  const removeMessage = useCallback((chatId: string, messageId: string) => {
    setMessages((prev) => {
      if (selectedIdRef.current !== chatId) return prev;
      return prev.filter((item) => item.id !== messageId);
    });
  }, []);

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

  const requestMessages = useCallback(async (chatId: string) => {
    const { data } = await chatsService.getMessages(chatId, {
      limit: 50,
      offset: 0,
    });
    const list = extractMessageList(data);
    return list
      .map((item) => mapMessageFromApi(item, chatId))
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }, []);

  const fetchChats = useCallback(async ({ silent }: FetchOptions = {}) => {
    if (!silent) {
      setChatsLoading(true);
      setChatsError(null);
    }

    try {
      const { data } = await chatsService.listChats();
      const list = extractChatList(data);
      const normalized = list.map((item) =>
        mapChatFromApi(item, CURRENT_USER_ID),
      );
      setChats(normalized);
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
    }
  }, [chats, selectedChatId]);

  useEffect(() => {
    selectedIdRef.current = selectedChatId;
  }, [selectedChatId]);

  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      setMessagesLoading(false);
      setMessagesError(null);
      setDraft("");
      setAttachment(null);
      return;
    }

    let active = true;
    setMessagesLoading(true);
    setMessagesError(null);

    requestMessages(selectedChatId)
      .then((items) => {
        if (!active) return;
        setMessages(items);
      })
      .catch((err) => {
        if (!active) return;
        console.error(
          `Failed to load messages for chat ${selectedChatId}`,
          err,
        );
        setMessages([]);
        setMessagesError("Failed to load messages");
      })
      .finally(() => {
        if (active) setMessagesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedChatId, requestMessages]);

  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (!selectedChatId) {
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

      ws.onmessage = async (event) => {
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
              upsertMessage(message);
            }
            return;
          }

          if (eventType === "message_deleted") {
            if (chatId && payload?.message_id) {
              removeMessage(chatId, payload.message_id);
            }
            return;
          }

          if (
            eventType === "typing" ||
            eventType === "pong" ||
            eventType === "ping"
          ) {
            return;
          }

          if (
            chatId &&
            selectedIdRef.current &&
            chatId === selectedIdRef.current
          ) {
            const items = await requestMessages(chatId);
            setMessages(items);
          }

          fetchChats({ silent: true }).catch(() => undefined);
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
    };
  }, [
    connectRequested,
    fetchChats,
    removeMessage,
    requestMessages,
    sendWsMessage,
    upsertMessage,
  ]);

  useEffect(() => {
    const trimmed = draft.trim();

    if (!selectedChatId || !wsReady) {
      if (isTypingRef.current && selectedChatId) {
        sendWsMessage("typing", { chat_id: selectedChatId, typing: false });
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
        sendWsMessage("typing", { chat_id: selectedChatId, typing: false });
        isTypingRef.current = false;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      return;
    }

    if (!isTypingRef.current) {
      sendWsMessage("typing", { chat_id: selectedChatId, typing: true });
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current && selectedIdRef.current) {
        sendWsMessage("typing", {
          chat_id: selectedIdRef.current,
          typing: false,
        });
        isTypingRef.current = false;
      }
    }, 2000);
  }, [draft, selectedChatId, wsReady, sendWsMessage]);

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
        typing: false,
      });
      isTypingRef.current = false;
    }

    setIsSending(true);
    setMessagesError(null);
    setDraft("");

    const chatId = selectedIdRef.current;
    const payload = {
      chat_id: chatId,
      content: trimmed,
      metadata: { type: "text" },
    };

    const finalizeRefresh = async () => {
      try {
        const items = await requestMessages(chatId);
        setMessages(items);
      } catch (err) {
        console.error(`Failed to refresh messages for chat ${chatId}`, err);
      }
      setAttachment(null);
    };

    const sentViaWs = sendWsMessage("send_message", payload);
    if (sentViaWs) {
      await finalizeRefresh();
      setIsSending(false);
      return;
    }

    try {
      await chatsService.sendMessage(chatId, { text: trimmed });
      await finalizeRefresh();
    } catch (err) {
      console.error("Failed to send message", err);
      setMessagesError("Failed to send message");
      setDraft(trimmed);
    } finally {
      setIsSending(false);
    }
  }, [attachment, draft, isSending, requestMessages, sendWsMessage]);

  const selectChat = useCallback((chatId: string) => {
    pendingJoinRef.current = chatId;
    setSelectedChatId(chatId);
    setConnectRequested(true);
  }, []);

  const selectedChat = useMemo(
    () => chats.find((chat) => chat.id === selectedChatId) ?? null,
    [chats, selectedChatId],
  );

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
  };
};

