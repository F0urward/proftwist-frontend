import { Avatar, Box, Chip, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

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
    createdAt: string;
};

const FALLBACK_USER: UserLite = { id: "unknown", name: "User" };

const initialsFrom = (s: string) =>
    s.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("") || "U";

const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const formatDateHeader = (iso: string) => {
    const date = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (sameDay(date, today)) return "Сегодня";
    if (sameDay(date, yesterday)) return "Вчера";
    return date.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "numeric" });
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
        .map(([key, items]) => ({ key, items: items.sort((x, y) => x.createdAt.localeCompare(y.createdAt)) }));
};

type Props = {
    chat: ChatLite;
    messages: MessageLite[];
    currentUserId: string;
};

const MessagesList = ({ chat, messages, currentUserId }: Props) => {
    const byId = new Map(chat.participants.map(u => [u.id, u] as const));
    const groups = groupByDate(messages);

    return (
        <Stack>
            {groups.map(({ key, items }) => (
                <Box key={key}>
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                        <Chip
                            label={formatDateHeader(items[0].createdAt)}
                            sx={{ bgcolor: alpha("#fff", 0.08), color: "#fff" }}
                        />
                    </Box>

                    <Stack spacing={1}>
                        {items.map(m => {
                            const mine = m.senderId === currentUserId;
                            const sender = byId.get(m.senderId) ?? FALLBACK_USER;
                            const senderAlt = sender.name || sender.nickname || "User";
                            const senderInitials = initialsFrom(senderAlt);

                            return (
                                <Stack
                                    key={m.id}
                                    direction="row"
                                    justifyContent={mine ? "flex-end" : "flex-start"}
                                    alignItems="flex-end"
                                    spacing={1}
                                >
                                    {!mine && chat.type === "group" && (
                                        <Avatar {...(sender.avatar ? { src: sender.avatar } : {})} alt={senderAlt} sx={{ width: 32, height: 32 }}>
                                            {!sender.avatar && senderInitials}
                                        </Avatar>
                                    )}

                                    <Stack spacing={0.5} sx={{ maxWidth: "70%" }}>
                                        <Box
                                            sx={{
                                                px: 1.5, py: 1, borderRadius: 3,
                                                bgcolor: mine ? "rgba(188,87,255,0.18)" : "rgba(255,255,255,0.06)",
                                                display: "flex",
                                                flexDirection: "column",
                                            }}
                                        >
                                            {!mine && chat.type === "group" && (
                                                <Typography variant="caption" sx={{ opacity: 0.7, display: "block" }}>
                                                    {sender.nickname || sender.name || "User"}
                                                </Typography>
                                            )}
                                            <Typography>{m.text}</Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{ opacity: 0.65, alignSelf: mine ? "flex-end" : "flex-start" }}
                                                >
                                                    {formatTime(m.createdAt)}
                                                </Typography>
                                        </Box>
                                    </Stack>
                                </Stack>
                            );
                        })}
                    </Stack>
                </Box>
            ))}
        </Stack>
    );
};

export default MessagesList;