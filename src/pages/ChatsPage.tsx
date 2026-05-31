import {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useSearchParams } from "react-router-dom";
import BaseLayout from "../components/BaseLayout/BaseLayout";
import ChatSidebar from "../components/ChatSidebar/ChatSidebar";
import ChatWindow from "../components/ChatWindow/ChatWindow";
import ThreadPanel from "../components/ThreadPanel/ThreadPanel";
import ParticipantsDialog from "../components/ParticipantsDialog/ParticipantsDialog";
import type { ChatWindowProps } from "../components/ChatWindow/ChatWindow";
import type { MessageComposerProps } from "../components/MessageComposer/MessageComposer";
import type { TabValue } from "../components/ChatSidebar/ChatSidebar";
import { useChatManager } from "../hooks/useChatManager";
import { mapUserFromApi, normalizeUserId } from "../utils/chat-utils";
import { chatsService, friendsService } from "../api";
import { useAppSelector } from "../store";
import type { Chat, ChatMessage, ChatUser } from "../types/chat";

const ChatsPage = () => {
  const authUserId = useAppSelector((state) => state.auth.user?.id);
  const {
    currentUserId,
    chats,
    chatsLoading,
    chatsError,
    selectedChat,
    selectedChatId,
    selectChat,
    messages,
    messagesLoading,
    messagesError,
    draft,
    handleDraftChange,
    sendMessage,
    isSending,
    attachment,
    pickAttachment,
    clearAttachment,
    typingNotice,
    refreshChats,
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
  } = useChatManager(authUserId ?? undefined);
  const resolvedUserId = authUserId ?? currentUserId;

  const [searchParams, setSearchParams] = useSearchParams();
  const chatQueryParam = searchParams.get("chat");

  const [tab, setTab] = useState<TabValue>("personal");
  const [query, setQuery] = useState("");
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [participants, setParticipants] = useState<ChatUser[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(
    null,
  );
  const [addingFriendId, setAddingFriendId] = useState<string | null>(null);
  const [friendRequestSent, setFriendRequestSent] = useState<
    Record<string, boolean>
  >({});
  const [friendRequestError, setFriendRequestError] = useState<string | null>(
    null,
  );
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const consumedChatParamRef = useRef(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  useEffect(() => {
    if (!chatQueryParam || consumedChatParamRef.current) return;
    const targetChat = chats.find((chat) => chat.id === chatQueryParam);
    if (!targetChat) return;
    consumedChatParamRef.current = true;
    if (tab !== targetChat.type) {
      setTab(targetChat.type as TabValue);
    }
    selectChat(chatQueryParam);
    if (isMobile) {
      setMobileView("chat");
    }
  }, [
    chatQueryParam,
    chats,
    selectChat,
    tab,
    searchParams,
    setSearchParams,
    isMobile,
  ]);

  const clearChatParam = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("chat");
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const filteredChats = useMemo(() => {
    const lower = query.toLowerCase();
    return chats
      .filter((chat) => chat.type === tab)
      .filter((chat) => chat.title.toLowerCase().includes(lower));
  }, [tab, query, chats]);

  const handleSend = () => {
    void sendMessage();
  };

  const composerProps: MessageComposerProps = {
    draft,
    onDraftChange: handleDraftChange,
    onSend: handleSend,
    isSending,
    attachment,
    onPickAttachment: pickAttachment,
    onClearAttachment: clearAttachment,
  };

  const threadRootMessage = useMemo(
    () => messages.find((m) => m.id === currentThreadRootId) ?? null,
    [messages, currentThreadRootId],
  );

  const handleOpenParticipants = useCallback(async () => {
    if (!selectedChat) return;
    setParticipantsOpen(true);
    setParticipantsLoading(true);
    setParticipantsError(null);
    setParticipants([]);
    setFriendRequestSent({});
    setFriendRequestError(null);
    setAddingFriendId(null);
    try {
      const response =
        selectedChat.type === "group"
          ? await chatsService.getGroupChatMembers({ chatId: selectedChat.id })
          : await chatsService.getDirectChatMembers({
              chatId: selectedChat.id,
            });
      const membersSource = Array.isArray(response?.data?.members)
        ? response.data.members
        : Array.isArray(response?.data)
          ? response.data
          : [];
      const normalized = membersSource.map((member: any) => {
        const mapped = mapUserFromApi({
          id: member?.user_id ?? member?.id,
          name: member?.name ?? member?.username,
          username: member?.username,
          avatar: member?.avatar_url ?? member?.avatar,
          ...member,
        });

        const candidateIds = new Set<string>();
        [
          member?.user_id,
          member?.id,
          member?.uuid,
          member?.user?.id,
          member?.user?.user_id,
          mapped.id,
        ].forEach((value) => {
          const normalizedId = normalizeUserId(value);
          if (normalizedId) candidateIds.add(normalizedId);
        });

        const isMarkedSelf = Boolean(
          member?.is_self ??
            member?.is_current_user ??
            member?.is_me ??
            member?.self ??
            member?.current_user,
        );

        const isSelf =
          isMarkedSelf ||
          (resolvedUserId ? candidateIds.has(resolvedUserId) : false);

        return {
          ...mapped,
          isCurrentUser: isSelf,
          originalId: candidateIds.values().next().value ?? mapped.id,
        };
      });
      setParticipants(normalized);
    } catch (err) {
      console.error("Failed to load participants", err);
      setParticipantsError("Не удалось загрузить участников");
    } finally {
      setParticipantsLoading(false);
    }
  }, [selectedChat, resolvedUserId]);

  const handleCloseParticipants = useCallback(() => {
    setParticipantsOpen(false);
  }, []);

  const handleAddFriend = useCallback(
    async (user: ChatUser) => {
      const targetId = normalizeUserId(user?.originalId ?? user?.id);
      const isSelf =
        user?.isCurrentUser || (resolvedUserId && targetId === resolvedUserId);

      if (!targetId || isSelf) return;

      setFriendRequestError(null);
      setAddingFriendId(targetId);
      try {
        await friendsService.createFriendRequest({
          target_user_id: targetId,
          message: `Привет, ${user?.nickname || user?.name || "друг"}! Давайте общаться.`,
        });
        setFriendRequestSent((prev) => ({ ...prev, [targetId]: true }));
        setParticipants((prev) =>
          prev.map((participant) => {
            const participantId = normalizeUserId(
              participant.originalId ?? participant.id,
            );
            if (participantId && participantId === targetId) {
              return {
                ...participant,
                friendshipStatus: { status: "pending", isSender: true },
              };
            }
            return participant;
          }),
        );
      } catch (err) {
        console.error("Failed to send friend request", err);
        setFriendRequestError("Не удалось отправить заявку в друзья");
      } finally {
        setAddingFriendId(null);
      }
    },
    [resolvedUserId],
  );

  const handleLeaveChat = useCallback(async () => {
    if (!selectedChat) return;
    setLeaveLoading(true);
    setLeaveError(null);
    try {
      await chatsService.leaveChat(selectedChat.id, selectedChat.type);
      setParticipantsOpen(false);
      closeConnection();
      await refreshChats({ silent: true });
    } catch (err) {
      console.error("Failed to leave chat", err);
      setLeaveError("Не удалось покинуть чат");
    } finally {
      setLeaveLoading(false);
    }
  }, [selectedChat, refreshChats, closeConnection]);

  const handleSelectChat = useCallback(
    (chatId: string) => {
      selectChat(chatId);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("chat", chatId);
        return next;
      });
      if (isMobile) setMobileView("chat");
    },
    [selectChat, setSearchParams, isMobile],
  );

  return (
    <BaseLayout>
      <Stack
        direction="row"
        gap={{ xs: 1, md: 2, lg: 3 }}
        sx={{ width: { xs: "100%", md: "80%" }, justifyContent: "center" }}
      >
        {(!isMobile || mobileView === "list") && (
          <ChatSidebar
            tab={tab}
            onTabChange={setTab}
            query={query}
            onQueryChange={setQuery}
            chats={filteredChats}
            chatsLoading={chatsLoading}
            chatsError={chatsError}
            selectedChatId={selectedChatId}
            onSelectChat={handleSelectChat}
            currentUserId={resolvedUserId}
          />
        )}

        {(!isMobile || mobileView === "chat") && (
          <ChatWindow
            currentUserId={resolvedUserId}
            selectedChat={selectedChat}
            tab={tab}
            messages={messages}
            messagesLoading={messagesLoading}
            messagesError={messagesError}
            typingNotice={typingNotice}
            composerProps={composerProps}
            onShowParticipants={handleOpenParticipants}
            onOpenThread={openThread}
            isMobile={isMobile}
            onBack={() => {
              clearChatParam();
              setMobileView("list");
            }}
          />
        )}

        {currentThreadRootId && (
          <ThreadPanel
            rootMessage={threadRootMessage}
            messages={threadMessages}
            loading={threadMessagesLoading}
            error={threadMessagesError}
            currentUserId={resolvedUserId}
            onClose={closeThread}
            draft={threadDraft}
            onDraftChange={handleThreadDraftChange}
            onSend={sendThreadMessage}
            isSending={isSendingThread}
          />
        )}

        <ParticipantsDialog
          open={participantsOpen}
          onClose={handleCloseParticipants}
          participants={participants}
          loading={participantsLoading}
          error={participantsError}
          friendRequestSent={friendRequestSent}
          addingFriendId={addingFriendId}
          friendRequestError={friendRequestError}
          leaveLoading={leaveLoading}
          leaveError={leaveError}
          resolvedUserId={resolvedUserId}
          onAddFriend={handleAddFriend}
          onLeaveChat={handleLeaveChat}
        />
      </Stack>
    </BaseLayout>
  );
};

export default ChatsPage;