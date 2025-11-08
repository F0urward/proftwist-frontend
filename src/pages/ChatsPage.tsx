import { useMemo, useState, useRef, useEffect, ChangeEvent } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
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
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import { alpha } from "@mui/material/styles";
import BaseLayout from "../components/BaseLayout/BaseLayout";
import MessagesList from "../components/MessageList/MessageList";
import { useChatManager } from "../hooks/useChatManager";
import { getChatAvatar } from "../utils/chat-utils";
import type { Chat, ChatMessage } from "../types/chat";

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
          alignItems: "flex-start",
          gap: 1.25,
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
          secondary={
            <Typography component="span" sx={{ opacity: 0.8, fontSize: 13 }}>
              {chat.lastMessage || "No messages yet"}
            </Typography>
          }
          slotProps={{
            primary: { sx: { fontWeight: 700 } },
            secondary: { sx: { color: alpha("#fff", 0.75) } },
          }}
        />

        <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.8 }}>
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
      width: { xs: 320, md: 380 },
      height: "80vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
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
        <Tab value="personal" label="Personal" />
        <Tab value="group" label="Group" />
      </Tabs>
    </Box>

    <Box sx={{ p: 2 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search chats"
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
                  aria-label="Clear"
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
            Loading chats...
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
            No chats found
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
        <IconButton
          aria-label="Attach file"
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
        />

        <TextField
          fullWidth
          size="small"
          placeholder="Write a message"
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
          sx={{ height: 44, width: 44, "& .MuiButton-endIcon": { m: 0 } }}
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
        width: { xs: 400, md: 620 },
        flex: 1,
        overflow: "hidden",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        height: "80vh",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        {selectedChat ? (
          <Stack direction="row" alignItems="center" spacing={2}>
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
          <Typography variant="h6" sx={{ opacity: 0.6 }}>
            Select a chat to start
          </Typography>
        )}

        {tab === "group" && (
          <Stack direction="row" spacing={1}>
            <Button variant="contained">Add Member</Button>
            <Button variant="contained">Create Group Chat</Button>
          </Stack>
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
            <Typography>Select a chat to get started</Typography>
          </Box>
        )}

        {selectedChat && (
          <>
            {messagesLoading && (
              <Box sx={{ textAlign: "center", opacity: 0.7, mt: 4 }}>
                Loading messages...
              </Box>
            )}

            {!messagesLoading && messagesError && (
              <Box sx={{ textAlign: "center", opacity: 0.7, mt: 4 }}>
                {messagesError}
              </Box>
            )}

            {!messagesLoading && !messagesError && messages.length === 0 && (
              <Box sx={{ textAlign: "center", opacity: 0.7, mt: 4 }}>
                Start the conversation
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
  } = useChatManager();

  const [tab, setTab] = useState<TabValue>("group");
  const [query, setQuery] = useState("");

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

  return (
    <BaseLayout>
      <Stack direction="row" spacing={3}>
        <ChatSidebar
          tab={tab}
          onTabChange={setTab}
          query={query}
          onQueryChange={setQuery}
          chats={filteredChats}
          chatsLoading={chatsLoading}
          chatsError={chatsError}
          selectedChatId={selectedChatId}
          onSelectChat={selectChat}
          currentUserId={currentUserId}
        />

        <ChatWindow
          currentUserId={currentUserId}
          selectedChat={selectedChat}
          tab={tab}
          messages={messages}
          messagesLoading={messagesLoading}
          messagesError={messagesError}
          typingNotice={typingNotice}
          composerProps={composerProps}
        />
      </Stack>
    </BaseLayout>
  );
};

export default ChatsPage;
