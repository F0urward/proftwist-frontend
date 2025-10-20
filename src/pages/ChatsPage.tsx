import { useMemo, useState, useRef, useEffect, ChangeEvent } from "react";
import { Avatar, Badge, Box, Button, Chip, Divider, IconButton, InputAdornment,
  List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Paper,
  Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import { alpha } from "@mui/material/styles";
import BaseLayout from "../components/BaseLayout/BaseLayout";
import MessagesList from "../components/MessageList/MessageList";

type User = {
    id: string;
    name: string;
    nickname?: string;
    avatar?: string;
};

type Chat = {
    id: string;
    title: string;
    type: "personal" | "group";
    participants: User[];
    groupAvatar?: string;
    lastMessage?: string;
    time?: string;
    unread?: number;
};

type Message = {
    id: string;
    chatId: string;
    senderId: string;
    text: string;
    createdAt: string;
};

type UsersMap = {
    me: User;
    u1: User;
    u2: User;
    u3: User;
};

const currentUserId = "me";

const users: UsersMap= {
    me: { id: "me", name: "Вы", nickname: "me" },
    u1: { id: "u1", name: "Полина", nickname: "polina" },
    u2: { id: "u2", name: "Маша", nickname: "masha" },
    u3: { id: "u3", name: "Артем", nickname: "art" },
};

const chats: Chat[] = [
    {
        id: "1",
        title: "Полина",
        type: "personal",
        participants: [users.me, users.u1],
        lastMessage: "Начните ваше общение",
        time: "10:44",
        unread: 2,
    },
    {
        id: "2",
        title: "Маша",
        type: "personal",
        participants: [users.me, users.u2],
        lastMessage: "Привет",
        time: "10:40",
        unread: 0,
    },
    {
        id: "3",
        title: "Frontend Crew",
        type: "group",
        participants: [users.me, users.u1, users.u3],
        groupAvatar: "",
        lastMessage: "Смотрим PR #124",
        time: "09:22",
        unread: 4,
    },
    {
        id: "4",
        title: "Golang Backend",
        type: "group",
        participants: [users.me, users.u2, users.u3],
        groupAvatar: "",
        lastMessage: "Обсудим роутер",
        time: "Вчера",
        unread: 0,
    },
];

const messagesByChat: Record<string, Message[]> = {
    "1": [
        { id: "m1", chatId: "1", senderId: "me", text: "Привет! Давай обсудим задачи?", createdAt: "2025-10-13T10:40:00" },
        { id: "m2", chatId: "1", senderId: "u1", text: "Да, глянь PR и пиши комменты", createdAt: "2025-10-13T10:41:00" },
        { id: "m3", chatId: "1", senderId: "me", text: "Ок!", createdAt: "2025-10-13T10:42:30" },
    ],
    "3": [
        { id: "m4", chatId: "3", senderId: "u3", text: "Кто на ревью?", createdAt: "2025-10-12T09:15:00" },
        { id: "m5", chatId: "3", senderId: "u1", text: "Я могу через час", createdAt: "2025-10-12T09:18:00" },
        { id: "m6", chatId: "3", senderId: "me", text: "Ок, давайте в 12:00", createdAt: "2025-10-12T09:20:00" },
    ],
};

const initialsFrom = (s: string) =>
    s.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("") || "U";

const FALLBACK_USER: User = { id: "unknown", name: "User" };

const getOtherUser = (chat: Chat, meId: string): User =>
    chat.participants.find(u => u.id !== meId) ?? chat.participants[0] ?? FALLBACK_USER;

const getChatAvatar = (chat: Chat, meId: string): { alt: string; initials: string } | { src: string; alt: string; initials: string } => {
    if (chat.type === "group") {
        const alt = chat.title || "Group";
        const initials = initialsFrom(alt);
        if (chat.groupAvatar && chat.groupAvatar.length > 0) 
            return { src: chat.groupAvatar, alt, initials };
        return { alt, initials };
    }
    const other = getOtherUser(chat, meId);
    const alt = other.name || other.nickname || "User";
    const initials = initialsFrom(alt);
    if (other.avatar && other.avatar.length > 0) 
        return { src: other.avatar, alt, initials };
    return { alt, initials };
};


const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const  ChatsPage = () => {
    const [tab, setTab] = useState<"personal" | "group">("personal");
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const filtered = useMemo(() => {
        return chats
        .filter(c => c.type === tab)
        .filter(c => c.title.toLowerCase().includes(query.toLowerCase()));
    }, [tab, query]);

    const selected = useMemo(() => chats.find(c => c.id === selectedId) || null, [selectedId]);

    const scrollRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: 1e9 });
    }, [selectedId]);

    const handleSend = () => {
        if (!selected) 
            return;
        if (!message.trim() && !file) 
            return;
        setMessage("");
        setFile(null);
        scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" });
    };

    const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) 
            setFile(f);
    };

  return (
    <BaseLayout>
        <Stack direction="row" spacing={3}>
            <Paper
                variant="outlined"
                sx={{
                    width: { xs: 320, md: 400 },
                    height: "80vh",
                    overflow: "hidden"
                }}
            >
                <Box 
                    sx={{
                        borderBottom: "1px solid rgba(255,255,255,.08)"
                    }}
                >
                    <Tabs
                        value={tab}
                        onChange={(_, v: "personal" | "group") => setTab(v)}
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
                        onChange={(e) => setQuery(e.target.value)}
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
                        {filtered.map((c) => {
                        const av = getChatAvatar(c, currentUserId);
                        const hasSrc = "src" in av;

                        return (
                            <ListItem
                                key={c.id}
                                disablePadding
                                sx={{ "&:not(:last-of-type) .MuiListItemButton-root": { borderBottom: "1px solid rgba(255,255,255,.08)" } }}
                            >
                            <ListItemButton
                                selected={selectedId === c.id}
                                onClick={() => setSelectedId(c.id)}
                                sx={{
                                    alignItems: "flex-start",
                                    gap: 1.25,
                                    "&.Mui-selected": { bgcolor: alpha("#BC57FF", 0.08) },
                                }}
                            >
                                <ListItemAvatar sx={{ alignSelf: "center" }}>
                                <Badge
                                    overlap="circular"
                                    badgeContent={c.unread || 0}
                                    invisible={!c.unread}
                                    sx={{ "& .MuiBadge-badge": { bgcolor: "#FF4DCA" } }}
                                >
                                    <Avatar {...(hasSrc ? { src: av.src } : {})} alt={av.alt} sx={{ width: 40, height: 40 }}>
                                        {!hasSrc && av.initials}
                                    </Avatar>
                                </Badge>
                                </ListItemAvatar>

                                <ListItemText
                                    primary={c.title}
                                    secondary={<Typography component="span" sx={{ opacity: 0.8, fontSize: 13 }}>{c.lastMessage || "Без сообщений"}</Typography>}
                                    slotProps={{
                                        primary: { sx: { fontWeight: 700 } },
                                        secondary: { sx: { color: alpha("#fff", 0.75) } },
                                    }}
                                />

                                <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.8 }}>{c.time}</Typography>
                            </ListItemButton>
                            </ListItem>
                            );
                        })}

                        {filtered.length === 0 && <Box sx={{ p: 3, textAlign: "center", opacity: 0.7 }}>Ничего не найдено</Box>}
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
                }}
            >

                <Box
                    sx={{
                        px: 2, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between",
                        borderBottom: "1px solid rgba(255,255,255,.08)",
                    }}
                >
                    {selected && (
                        <Stack direction="row" alignItems="center" spacing={2}>
                            {(() => {
                                const av = getChatAvatar(selected, currentUserId);
                                const hasSrc = "src" in av;

                                return (
                                <Avatar
                                    {...(hasSrc ? { src: av.src } : {})}
                                    alt={av.alt}
                                    sx={{ width: 40, height: 40 }}
                                >
                                    {!hasSrc && av.initials}
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
                                {selected.title}
                            </Typography>
                        </Stack>
                    )}

                    {tab === "group" && (
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                            >
                                Вступить в чат
                            </Button>
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
                    {!selected && (
                        <Box sx={{ height:"100%", textAlign: "center", alignContent: "center" }}>
                            <Typography>Выберите чат слева</Typography>
                        </Box>
                    )}

                    {selected && (
                        <MessagesList
                            chat={selected}
                            messages={messagesByChat[selected.id] || []}
                            currentUserId={currentUserId}
                        />
                    )}
                </Box>

                <Box sx={{ px: 2, py: 2, borderTop: "1px solid rgba(255,255,255,.08)" }}>
                    {file && (
                        <Box sx={{ mb: 2 }}>
                            <Chip
                                label={file.name}
                                onDelete={() => setFile(null)}
                                deleteIcon={<CloseIcon />}
                                sx={{ bgcolor: alpha("#fff", 0.08), color: "#fff" }}
                            />
                        </Box>
                    )}

                    <Stack direction="row" spacing={ 2 } alignItems="flex-end">
                        <IconButton
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
                            onChange={onPickFile}
                        />

                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Введите сообщение"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                                }
                            }}
                            multiline
                            minRows={1}
                            maxRows={4}
                            sx={{
                                "& .MuiInputBase-root": { bgcolor: "#181818", borderRadius: 3, minHeight: 44,},
                                "& fieldset": { borderColor: alpha("#fff", 0.16) },
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleSend}
                            endIcon={<SendIcon />}
                            sx={{ height: 44, width: 44, "& .MuiButton-endIcon": { m: 0 } }}
                        >
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Stack>
    </BaseLayout>
  );
}

export default ChatsPage;
