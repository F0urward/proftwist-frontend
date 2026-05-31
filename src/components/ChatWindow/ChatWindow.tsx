import { useRef, useEffect } from "react";
import { Avatar, Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { Chat, ChatMessage } from "../../types/chat";
import { getChatAvatar } from "../../utils/chat-utils";
import MessagesList from "../MessageList/MessageList";
import MessageComposer from "../MessageComposer/MessageComposer";
import type { MessageComposerProps } from "../MessageComposer/MessageComposer";

type TabValue = "personal" | "group";

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
  onOpenThread: (messageId: string) => void;
  isMobile?: boolean;
  onBack?: () => void;
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
  onOpenThread,
  onBack,
  isMobile,
}: ChatWindowProps) => {
  const theme = useTheme();
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
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {isMobile && onBack && (
          <IconButton
            onClick={onBack}
            sx={{ color: "text.primary" }}
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
                backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
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
                onOpenThread={onOpenThread}
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

export default ChatWindow;
export type { ChatWindowProps };