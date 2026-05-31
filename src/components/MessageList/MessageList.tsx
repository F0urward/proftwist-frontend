import { Avatar, Box, Chip, IconButton, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ReplyIcon from "@mui/icons-material/Reply";

export type UserLite = {
  id: string;
  name?: string;
  nickname?: string;
  avatar?: string;
};

export type ChatLite = {
  type: "personal" | "group";
  title: string;
  participants: UserLite[];
};

export type MessageLite = {
  id: string;
  senderId: string;
  text: string;
  kind?: "text" | "system";
  createdAt: string;
  threadRootId?: string;
  replyCount?: number;
};

const FALLBACK_USER: UserLite = { id: "unknown", name: "Пользователь" };

const initialsFrom = (s: string) =>
  s
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "П";

const pluralize = (n: number, forms: [string, string, string]): string => {
  const abs = Math.abs(n) % 100;
  const n1 = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatDateHeader = (iso: string) => {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (sameDay(date, today)) return "Сегодня";
  if (sameDay(date, yesterday)) return "Вчера";
  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const groupByDate = (messages: MessageLite[]) => {
  const map = new Map<string, MessageLite[]>();
  for (const m of messages) {
    const d = new Date(m.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, items]) => ({
      key,
      items: items.sort((x, y) => x.createdAt.localeCompare(y.createdAt)),
    }));
};

type Props = {
  chat: ChatLite;
  messages: MessageLite[];
  currentUserId: string;
  onOpenThread?: (messageId: string) => void;
};

const MessagesList = ({ chat, messages, currentUserId, onOpenThread }: Props) => {
  const theme = useTheme();
  const byId = new Map(chat.participants.map((u) => [u.id, u] as const));
  const groups = groupByDate(messages);

  return (
    <Stack>
      {groups.map(({ key, items }) => (
        <Box key={key}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <Chip
              label={formatDateHeader(items[0].createdAt)}
              sx={{ bgcolor: alpha(theme.palette.text.primary, 0.08), color: "text.primary" }}
            />
          </Box>

          <Stack spacing={1}>
            {items.map((m) => {
              const mine = m.senderId === currentUserId;

              const sender = byId.get(m.senderId) ?? FALLBACK_USER;
              const senderAlt =
                sender.name || sender.nickname || "Пользователь";
              const senderInitials = initialsFrom(senderAlt);

              if (m.kind === "system") {
                return (
                  <Box
                    key={m.id}
                    sx={{
                      textAlign: "center",
                      opacity: 0.65,
                      fontStyle: "italic",
                    }}
                  >
                    {m.text}
                  </Box>
                );
              }

              return (
                <Box
                  sx={{
                    "&:hover .reply-btn": { opacity: 1 },
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent={mine ? "flex-end" : "flex-start"}
                    alignItems="flex-end"
                    spacing={1}
                  >
                    {!mine && chat.type === "group" && (
                      <Avatar
                        {...(sender.avatar ? { src: sender.avatar } : {})}
                        alt={senderAlt}
                        sx={{ width: 32, height: 32 }}
                      >
                        {!sender.avatar && senderInitials}
                      </Avatar>
                    )}

                    <Box sx={{ position: "relative", maxWidth: "70%" }}>
                      <Stack
                        spacing={0.5}
                        sx={{
                          alignItems: mine ? "flex-end" : "flex-start",
                        }}
                      >
                        <Box
                          sx={{
                            px: 1.5,
                            py: 1,
                            borderRadius: 3,
                            bgcolor: mine
                              ? "rgba(188,87,255,0.18)"
                              : "rgba(255,255,255,0.06)",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {!mine && chat.type === "group" && (
                            <Typography
                              variant="caption"
                              sx={{ opacity: 0.7, display: "block" }}
                            >
                              {sender.nickname || sender.name || "Пользователь"}
                            </Typography>
                          )}
                          <Typography sx={{ overflowWrap: "break-word" }}>
                            {m.text}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.65,
                              alignSelf: mine ? "flex-end" : "flex-start",
                            }}
                          >
                            {formatTime(m.createdAt)}
                          </Typography>
                          {chat.type === "group" && typeof m.replyCount === "number" && m.replyCount > 0 && (
                            <Typography
                              variant="caption"
                              sx={{
                                opacity: 0.5,
                                fontSize: 11,
                                mt: 0.5,
                                alignSelf: mine ? "flex-end" : "flex-start",
                              }}
                            >
                              {m.replyCount} {pluralize(m.replyCount, ["ответ", "ответа", "ответов"])}
                            </Typography>
                          )}
                        </Box>
                      </Stack>

                      {chat.type === "group" && (
                        <IconButton
                          className="reply-btn"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenThread?.(m.id);
                          }}
                          sx={{
                            position: "absolute",
                            bottom: -12,
                            right: -12,
                            width: 28,
                            height: 28,
                            opacity: 0,
                            transition: "opacity 0.15s",
                            bgcolor: "background.paper",
                            border: 1,
                            borderColor: "divider",
                            boxShadow: 1,
                            zIndex: 1,
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          <ReplyIcon sx={{ width: 14, height: 14 }} />
                        </IconButton>
                      )}
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};

export default MessagesList;
