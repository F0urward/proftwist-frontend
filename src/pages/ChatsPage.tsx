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
  } = useChatManager();

  const [tab, setTab] = useState<"personal" | "group">("group");
  const [query, setQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredChats = useMemo(() => {
    const lower = query.toLowerCase();
    return chats
      .filter((chat) => chat.type === tab)
      .filter((chat) => chat.title.toLowerCase().includes(lower));
  }, [tab, query, chats]);

  useEffect(() => {
    if (!messages.length) return;
    scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" });
  }, [messages, selectedChatId]);

  const handleSend = () => {
    void sendMessage();
  };

  const onPickFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    pickAttachment(file);
  };

  const trimmedDraft = draft.trim();

  return (
    <BaseLayout>
      <Stack direction="row" spacing={3}>
        <Paper
          variant="outlined"
          sx={{
            width: { xs: 320, md: 400 },
            height: "80vh",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              borderBottom: "1px solid rgba(255,255,255,.08)",
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, value: "personal" | "group") => setTab(value)}
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
              onChange={(event) => setQuery(event.target.value)}
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
                        onClick={() => setQuery("")}
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

          <Box>
            <List disablePadding>
              {chatsLoading && (
                <Box sx={{ p: 3, textAlign: "center", opacity: 0.7 }}>
                  Loading chats...
                </Box>
              )}

              {filteredChats.map((chat) => {
                const avatar = getChatAvatar(chat, currentUserId);
                const hasSrc = "src" in avatar;

                return (
                  <ListItem
                    key={chat.id}
                    disablePadding
                    sx={{
                      "&:not(:last-of-type) .MuiListItemButton-root": {
                        borderBottom: "1px solid rgba(255,255,255,.08)",
                      },
                    }}
                  >
                    <ListItemButton
                      selected={selectedChatId === chat.id}
                      onClick={() => selectChat(chat.id)}
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
                          <Typography
                            component="span"
                            sx={{ opacity: 0.8, fontSize: 13 }}
                          >
                            {chat.lastMessage || "No messages yet"}
                          </Typography>
                        }
                        slotProps={{
                          primary: { sx: { fontWeight: 700 } },
                          secondary: { sx: { color: alpha("#fff", 0.75) } },
                        }}
                      />

                      <Typography
                        variant="caption"
                        sx={{ opacity: 0.7, mt: 0.8 }}
                      >
                        {chat.time}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                );
              })}

              {!chatsLoading && !chatsError && filteredChats.length === 0 && (
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
            {selectedChat && (
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
            )}

            {tab === "group" && (
              <Stack
                direction="row"
                spacing={1}
                display="flex"
                justifyContent="space-between"
              >
                <Button variant="contained">Add Member</Button>
                <Button variant="contained">Create Group Chat</Button>
              </Stack>
            )}
          </Box>

          <Box
            ref={scrollRef}
            sx={{
              p: 2.5,
              overflow: "auto",
            }}
          >
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

                {!messagesLoading &&
                  !messagesError &&
                  messages.length === 0 && (
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

          <Box
            sx={{ px: 2, py: 2, borderTop: "1px solid rgba(255,255,255,.08)" }}
          >
            {attachment && (
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={attachment.name}
                  onDelete={clearAttachment}
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
                onChange={onPickFile}
              />

              <TextField
                fullWidth
                size="small"
                placeholder="Write a message"
                value={draft}
                onChange={(event) => handleDraftChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
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
                onClick={handleSend}
                endIcon={<SendIcon />}
                disabled={
                  isSending || trimmedDraft.length === 0 || Boolean(attachment)
                }
                sx={{ height: 44, width: 44, "& .MuiButton-endIcon": { m: 0 } }}
              ></Button>
            </Stack>
          </Box>
        </Paper>
      </Stack>
    </BaseLayout>
  );
};

export default ChatsPage;
