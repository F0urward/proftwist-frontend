import {
  useMemo,
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  useCallback,
} from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import SendIcon from "@mui/icons-material/Send";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import { alpha } from "@mui/material/styles";
import { useSearchParams } from "react-router-dom";
import BaseLayout from "../components/BaseLayout/BaseLayout";
import MessagesList from "../components/MessageList/MessageList";
import { useChatManager } from "../hooks/useChatManager";
import {
  getChatAvatar,
  mapUserFromApi,
  initialsFrom,
} from "../utils/chat-utils";
import { chatsService, friendsService } from "../api";
import { useAppSelector } from "../store";
import type { Chat, ChatMessage, ChatUser } from "../types/chat";

type TabValue = "personal" | "group";

type ChatSidebarProps = {
  tab: TabValue;
  onTabChange: (value: TabValue) => void;
  query: string;
  onQueryChange: (value: string) => void;
  chats: Chat[];
  chatsLoading: boolean;
  chatsError: string | null;
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  currentUserId: string;
};

type MessageComposerProps = {
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  attachment: File | null;
  onPickAttachment: (file: File | null) => void;
  onClearAttachment: () => void;
};

type ChatWindowProps = {
  currentUserId: string;
  selectedChat: Chat | null;
  tab: TabValue;
  messages: ChatMessage[];
  messagesLoading: boolean;
  messagesError: string | null;
  typingNotice: string | null;
  composerProps: MessageComposerProps;
  onShowParticipants: () => void;
  isMobile?: boolean;
  onBack?: () => void;
};

const normalizeUserId = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
};

type FriendshipUiState =
  | { status: "none" }
  | { status: "pending"; isSender?: boolean }
  | { status: "rejected"; isSender?: boolean }
  | { status: "accepted"; isSender?: boolean };

const getFriendshipUiState = (
  user: ChatUser,
  hasLocalPending: boolean,
): FriendshipUiState => {
  if (hasLocalPending) {
    return { status: "pending", isSender: true };
  }

  if (!user.friendshipStatus) return { status: "none" };

  const { status, isSender } = user.friendshipStatus;
  if (status === "accepted") return { status: "accepted", isSender };
  if (status === "rejected") return { status: "rejected", isSender };
  if (status === "pending") return { status: "pending", isSender };

  return { status: "none" };
};

const ChatListItem = ({
  chat,
  isSelected,
  onSelect,
  currentUserId,
}: {
  chat: Chat;
  isSelected: boolean;
  onSelect: () => void;
  currentUserId: string;
}) => {
  const avatar = getChatAvatar(chat, currentUserId);
  const hasSrc = "src" in avatar;

  return (
    <ListItem
      disablePadding
      sx={{
        "&:not(:last-of-type) .MuiListItemButton-root": {
          borderBottom: "1px solid rgba(255,255,255,.08)",
        },
      }}
    >
      <ListItemButton
        selected={isSelected}
        onClick={onSelect}
        sx={{
          alignItems: "center",
          gap: { md: 1.25 },
          minHeight: 76,
          "&.Mui-selected": { bgcolor: alpha("#BC57FF", 0.08) },
        }}
      >
        <ListItemAvatar sx={{ alignSelf: "center" }}>
          <Badge
            overlap="circular"
            badgeContent={chat.unread || 0}
            invisible={!chat.unread}
            sx={{ "& .MuiBadge-badge": { bgcolor: "#FF4DCA" } }}
          >
            <Avatar
              {...(hasSrc ? { src: avatar.src } : {})}
              alt={avatar.alt}
              sx={{ width: 40, height: 40 }}
            >
              {!hasSrc && avatar.initials}
            </Avatar>
          </Badge>
        </ListItemAvatar>

        <ListItemText
          primary={chat.title}
          secondary={chat.lastMessage || "Сообщений пока нет"}
          primaryTypographyProps={{
            sx: {
              fontWeight: 700,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
          secondaryTypographyProps={{
            sx: {
              color: alpha("#fff", 0.75),
              fontSize: 13,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
        />

        <Typography
          variant="caption"
          sx={{ opacity: 0.7, alignSelf: "flex-start", mt: 0.9 }}
        >
          {chat.time}
        </Typography>
      </ListItemButton>
    </ListItem>
  );
};

const ChatSidebar = ({
  tab,
  onTabChange,
  query,
  onQueryChange,
  chats,
  chatsLoading,
  chatsError,
  selectedChatId,
  onSelectChat,
  currentUserId,
}: ChatSidebarProps) => (
  <Paper
    variant="outlined"
    sx={{
      width: { xs: "100%", sm: 240, md: 320, lg: 360 },
      height: { xs: "calc(100dvh - 120px)", md: "80vh" },
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      borderRadius: 5,
    }}
  >
    <Box sx={{ borderBottom: "1px solid rgba(255,255,255,.08)" }}>
      <Tabs
        value={tab}
        onChange={(_, value: TabValue) => onTabChange(value)}
        variant="fullWidth"
        sx={{
          "& .MuiTabs-indicator": { display: "none" },
          "& .MuiTab-root": {
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            borderRight: "1px solid rgba(255,255,255,.08)",
            "&:last-of-type": { borderRight: "none" },
            "&.Mui-selected": {
              color: "#fff",
              bgcolor: "#733E97",
            },
          },
        }}
      >
        <Tab value="personal" label="Личные" />
        <Tab value="group" label="Групповые" />
      </Tabs>
    </Box>

    <Box sx={{ p: 2 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Поиск по чатам"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "#fff" }} />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Очистить"
                  onClick={() => onQueryChange("")}
                  size="small"
                  sx={{ color: "#fff" }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          },
        }}
        sx={{
          "& .MuiInputBase-root": { bgcolor: "#181818", borderRadius: 3 },
        }}
      />
    </Box>

    <Divider sx={{ borderColor: "rgba(255,255,255,.08)" }} />

    <Box sx={{ flex: 1, overflowY: "auto" }}>
      <List disablePadding>
        {chatsLoading && (
          <Box sx={{ p: 3, textAlign: "center", opacity: 0.7 }}>
            Загрузка чатов...
          </Box>
        )}

        {!chatsLoading &&
          chats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              currentUserId={currentUserId}
              isSelected={selectedChatId === chat.id}
              onSelect={() => onSelectChat(chat.id)}
            />
          ))}

        {!chatsLoading && !chatsError && chats.length === 0 && (
          <Box sx={{ p: 3, textAlign: "center", opacity: 0.7 }}>
            Чаты не найдены
          </Box>
        )}

        {!chatsLoading && chatsError && (
          <Box sx={{ p: 3, textAlign: "center", opacity: 0.7 }}>
            {chatsError}
          </Box>
        )}
      </List>
    </Box>
  </Paper>
);

const MessageComposer = ({
  draft,
  onDraftChange,
  onSend,
  isSending,
  attachment,
  onPickAttachment,
  onClearAttachment,
}: MessageComposerProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const trimmedDraft = draft.trim();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onPickAttachment(file);
    event.target.value = "";
  };

  return (
    <Box sx={{ px: 2, py: 2, borderTop: "1px solid rgba(255,255,255,.08)" }}>
      {attachment && (
        <Box sx={{ mb: 2 }}>
          <Chip
            label={attachment.name}
            onDelete={onClearAttachment}
            deleteIcon={<CloseIcon />}
            sx={{ bgcolor: alpha("#fff", 0.08), color: "#fff" }}
          />
        </Box>
      )}

      <Stack direction="row" spacing={2} alignItems="flex-end">
        {/*<IconButton
          aria-label="Прикрепить файл"
          sx={{ color: "#fff", height: 44, width: 20 }}
          onClick={() => fileInputRef.current?.click()}
        >
          <AttachFileIcon />
        </IconButton>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />*/}

        <TextField
          fullWidth
          size="small"
          placeholder="Напишите сообщение"
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          multiline
          minRows={1}
          maxRows={4}
          sx={{
            "& .MuiInputBase-root": {
              bgcolor: "#181818",
              borderRadius: 3,
              minHeight: 44,
            },
            "& fieldset": { borderColor: alpha("#fff", 0.16) },
          }}
        />
        <Button
          variant="contained"
          onClick={onSend}
          endIcon={<SendIcon />}
          disabled={
            isSending || trimmedDraft.length === 0 || Boolean(attachment)
          }
          sx={{
            height: 44,
            width: 44,
            color: "#fff",
            "&.Mui-disabled": {
              color: "#fff",
              opacity: 0.6,
            },
            "& .MuiButton-endIcon": { m: 0 },
          }}
        />
      </Stack>
    </Box>
  );
};

const ChatWindow = ({
  currentUserId,
  selectedChat,
  tab,
  messages,
  messagesLoading,
  messagesError,
  typingNotice,
  composerProps,
  onShowParticipants,
  onBack,
  isMobile,
}: ChatWindowProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!selectedChat || messages.length === 0) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, selectedChat?.id]);

  return (
    <Paper
      variant="outlined"
      sx={{
        width: { xs: 350, md: 560, lg: 620 },
        flex: 1,
        overflow: "hidden",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        height: { xs: "calc(100dvh - 120px)", md: "80vh" },
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        {isMobile && onBack && (
          <IconButton
            onClick={onBack}
            sx={{ color: "#fff" }}
            aria-label="Назад к списку чатов"
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        {selectedChat ? (
          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 1, md: 2 }}
            {...(tab === "group"
              ? {
                  sx: { userSelect: "none", cursor: "pointer" },
                  onClick: onShowParticipants,
                }
              : { sx: { userSelect: "none" } })}
          >
            {(() => {
              const avatar = getChatAvatar(selectedChat, currentUserId);
              const hasSrc = "src" in avatar;

              return (
                <Avatar
                  {...(hasSrc ? { src: avatar.src } : {})}
                  alt={avatar.alt}
                  sx={{ width: 40, height: 40 }}
                >
                  {!hasSrc && avatar.initials}
                </Avatar>
              );
            })()}

            <Typography
              variant="h6"
              sx={{
                fontFamily: '"TDAText", "Lato", sans-serif',
                backgroundImage: "linear-gradient(90deg, #BC57FF, #FF4DCA)",
                backgroundClip: "text",
                color: "transparent",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {selectedChat.title}
            </Typography>
          </Stack>
        ) : (
          <Box sx={{ width: "100%", justifyItems: "center" }}>
            <Typography variant="h6" sx={{ opacity: 0.6 }}>
              Выберите чат, чтобы начать
            </Typography>
          </Box>
        )}
      </Box>

      <Box ref={scrollRef} sx={{ p: 2.5, overflow: "auto" }}>
        {!selectedChat && (
          <Box
            sx={{
              height: "100%",
              textAlign: "center",
              alignContent: "center",
            }}
          >
            <Typography>Выберите чат, чтобы начать общение</Typography>
          </Box>
        )}

        {selectedChat && (
          <>
            {messagesLoading && (
              <Box sx={{ textAlign: "center", opacity: 0.7, mt: 4 }}>
                Загрузка сообщений...
              </Box>
            )}

            {!messagesLoading && messagesError && (
              <Box sx={{ textAlign: "center", opacity: 0.7, mt: 4 }}>
                {messagesError}
              </Box>
            )}

            {!messagesLoading && !messagesError && messages.length === 0 && (
              <Box sx={{ textAlign: "center", opacity: 0.7, mt: 4 }}>
                Начните общение
              </Box>
            )}

            {!messagesLoading && !messagesError && messages.length > 0 && (
              <MessagesList
                chat={selectedChat}
                messages={messages}
                currentUserId={currentUserId}
              />
            )}
          </>
        )}
      </Box>

      {selectedChat && typingNotice && (
        <Box
          sx={{
            px: 2.5,
            py: 1,
            textAlign: "center",
            opacity: 0.75,
            fontStyle: "italic",
          }}
        >
          {typingNotice}
        </Box>
      )}

      {selectedChat && <MessageComposer {...composerProps} />}
    </Paper>
  );
};

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
            isMobile={isMobile}
            onBack={() => {
              clearChatParam();
              setMobileView("list");
            }}
          />
        )}

        <Dialog
          open={participantsOpen}
          onClose={handleCloseParticipants}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Участники чата</DialogTitle>
          <DialogContent dividers>
            {participantsLoading && (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            {!participantsLoading && participantsError && (
              <Typography sx={{ textAlign: "center", opacity: 0.8 }}>
                {participantsError}
              </Typography>
            )}

            {!participantsLoading &&
              !participantsError &&
              participants.length === 0 && (
                <Typography sx={{ textAlign: "center", opacity: 0.8 }}>
                  Нет участников
                </Typography>
              )}

            {!participantsLoading &&
              !participantsError &&
              participants.length > 0 && (
                <List disablePadding>
                  {participants.map((user) => {
                    const displayName =
                      user.nickname || user.name || "Пользователь";
                    const initials = initialsFrom(displayName);
                    const participantId = user.originalId ?? user.id;
                    const normalizedParticipantId =
                      normalizeUserId(participantId);
                    const participantKey =
                      normalizedParticipantId ?? participantId ?? user.id;
                    const isCurrentUser =
                      user.isCurrentUser ??
                      (resolvedUserId && normalizedParticipantId
                        ? normalizedParticipantId === resolvedUserId
                        : user.id === resolvedUserId);
                    const requestSent = participantKey
                      ? Boolean(friendRequestSent[participantKey])
                      : false;
                    const isSubmitting = participantKey
                      ? addingFriendId === participantKey
                      : false;
                    const friendshipState = getFriendshipUiState(
                      user,
                      requestSent,
                    );

                    let actionLabel = "Добавить в друзья";
                    let actionVariant: "outlined" | "contained" = "outlined";
                    let actionColor: "primary" | "secondary" | "success" =
                      "primary";
                    let actionDisabled =
                      !participantKey || requestSent || isSubmitting;

                    if (friendshipState.status === "pending") {
                      actionLabel = "Заявка отправлена";
                      actionVariant = "contained";
                      actionDisabled = true;
                    } else if (friendshipState.status === "rejected") {
                      actionLabel = "Подписаны";
                      actionVariant = "outlined";
                      actionColor = "secondary";
                      actionDisabled = true;
                    } else if (friendshipState.status === "accepted") {
                      actionLabel = "В друзьях";
                      actionVariant = "contained";
                      actionColor = "success";
                      actionDisabled = true;
                    }

                    const requestSentState =
                      friendshipState.status === "pending";
                    const actionSx = {
                      minWidth: 120,
                      ...(requestSentState
                        ? {
                            color: "#fff",
                            "&.Mui-disabled": {
                              color: "#fff",
                            },
                          }
                        : {}),
                    };

                    return (
                      <ListItem key={user.id} disablePadding>
                        <ListItemButton
                          disableRipple
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            py: 1,
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              {...(user.avatar ? { src: user.avatar } : {})}
                              alt={displayName}
                            >
                              {!user.avatar && initials}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={displayName}
                            secondary={
                              user.name && user.name !== displayName
                                ? user.name
                                : undefined
                            }
                            sx={{ mr: 1 }}
                          />
                          {!isCurrentUser && (
                            <Button
                              size="small"
                              variant={actionVariant}
                              color={actionColor}
                              disabled={actionDisabled}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                void handleAddFriend(user);
                              }}
                              sx={actionSx}
                            >
                              {isSubmitting ? (
                                <CircularProgress size={16} />
                              ) : (
                                actionLabel
                              )}
                            </Button>
                          )}
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              )}

            {friendRequestError && (
              <Typography
                color="error"
                variant="body2"
                sx={{ mt: 2, textAlign: "center" }}
              >
                {friendRequestError}
              </Typography>
            )}

            {leaveError && (
              <Typography
                color="error"
                variant="body2"
                sx={{ mt: 2, textAlign: "center" }}
              >
                {leaveError}
              </Typography>
            )}

            <Box sx={{ mt: 3 }}>
              <Button
                fullWidth
                color="error"
                variant="contained"
                onClick={handleLeaveChat}
                disabled={leaveLoading}
              >
                {leaveLoading ? "Выход..." : "Покинуть чат"}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Stack>
    </BaseLayout>
  );
};

export default ChatsPage;
