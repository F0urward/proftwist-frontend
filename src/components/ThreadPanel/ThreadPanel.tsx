import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { alpha, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { ChatMessage } from "../../types/chat";
import { initialsFrom } from "../../utils/chat-utils";

const pluralize = (n: number, forms: [string, string, string]): string => {
  const abs = Math.abs(n) % 100;
  const n1 = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
};

type ThreadPanelProps = {
  rootMessage: ChatMessage | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  currentUserId: string;
  onClose: () => void;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const ThreadPanel = ({
  rootMessage,
  messages,
  loading,
  error,
  currentUserId,
  onClose,
  draft,
  onDraftChange,
  onSend,
  isSending,
}: ThreadPanelProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const trimmedDraft = draft.trim();
  const [isFocused, setIsFocused] = useState(false);

  const content = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {rootMessage && (
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Avatar
              {...(rootMessage.senderAvatar
                ? { src: rootMessage.senderAvatar }
                : {})}
              alt={rootMessage.senderName || "User"}
              sx={{ width: 32, height: 32, mt: 0.5 }}
            >
              {!rootMessage.senderAvatar &&
                initialsFrom(rootMessage.senderName || "П")}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, opacity: 0.8 }}
              >
                {rootMessage.senderNickname ||
                  rootMessage.senderName ||
                  "Пользователь"}
              </Typography>
              <Typography
                sx={{ fontSize: 14, mt: 0.5, overflowWrap: "break-word" }}
              >
                {rootMessage.text}
              </Typography>
              <Typography
                variant="caption"
                sx={{ opacity: 0.6, mt: 0.5, display: "block" }}
              >
                {formatTime(rootMessage.createdAt)}
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}

      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.6 }}>
          {messages.length === 0
            ? "Нет ответов"
            : `${messages.length} ${pluralize(messages.length, ["ответ", "ответа", "ответов"])}`}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", px: 2 }}>
        {loading && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!loading && error && (
          <Typography sx={{ textAlign: "center", opacity: 0.7, py: 4 }}>
            {error}
          </Typography>
        )}

        {!loading && !error && (
          <Stack spacing={1.5}>
            {messages.map((m) => {
              const mine = m.senderId === currentUserId;
              return (
                <Stack
                  key={m.id}
                  direction="row"
                  justifyContent={mine ? "flex-end" : "flex-start"}
                  alignItems="flex-end"
                  spacing={1}
                >
                  {!mine && (
                    <Avatar
                      {...(m.senderAvatar ? { src: m.senderAvatar } : {})}
                      alt={m.senderName || "User"}
                      sx={{ width: 28, height: 28 }}
                    >
                      {!m.senderAvatar && initialsFrom(m.senderName || "П")}
                    </Avatar>
                  )}
                  <Box
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderRadius: 3,
                      maxWidth: "80%",
                      bgcolor: mine
                        ? "rgba(188,87,255,0.18)"
                        : "rgba(255,255,255,0.06)",
                    }}
                  >
                    {!mine && (
                      <Typography
                        variant="caption"
                        sx={{ opacity: 0.7, display: "block" }}
                      >
                        {m.senderNickname || m.senderName || "Пользователь"}
                      </Typography>
                    )}
                    <Typography
                      sx={{ overflowWrap: "break-word", fontSize: 14 }}
                    >
                      {m.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.65,
                        display: "block",
                        textAlign: mine ? "right" : "left",
                        mt: 0.25,
                      }}
                    >
                      {formatTime(m.createdAt)}
                    </Typography>
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Box>

      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-end">
          <TextField
            fullWidth
            size="small"
            placeholder="Напишите ответ..."
            value={draft}
            onChange={(e) => onDraftChange(e.target.value.slice(0, 512))}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            multiline
            minRows={1}
            maxRows={4}
            sx={{
              "& .MuiInputBase-root": {
                bgcolor: "background.default",
                borderRadius: 3,
                minHeight: 44,
              },
              "& fieldset": {
                borderColor: alpha(theme.palette.text.primary, 0.16),
              },
            }}
          />
          <Button
            variant="contained"
            onClick={onSend}
            endIcon={<SendIcon />}
            disabled={isSending || trimmedDraft.length === 0}
            sx={{
              height: 44,
              width: 44,
              minWidth: 44,
              color: "text.primary",
              "&.Mui-disabled": { color: "text.primary", opacity: 0.6 },
              "& .MuiButton-endIcon": { m: 0 },
            }}
          />
        </Stack>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Dialog open onClose={onClose} fullScreen>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            edge="start"
            onClick={onClose}
            sx={{ color: "text.primary" }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6">Подтема</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        width: { md: 300, lg: 340 },
        height: { xs: "calc(100dvh - 120px)", md: "80vh" },
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        borderRadius: 5,
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Подтема
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: "text.primary" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      {content}
    </Paper>
  );
};

export default ThreadPanel;
