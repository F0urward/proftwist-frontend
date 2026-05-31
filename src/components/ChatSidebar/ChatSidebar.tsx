import { Box, Divider, IconButton, InputAdornment, List, Paper, Tab, Tabs, TextField } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import type { Chat } from "../../types/chat";
import ChatListItem from "../ChatListItem/ChatListItem";

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
}: ChatSidebarProps) => {
  const theme = useTheme();
  return (
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
      <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Tabs
          value={tab}
          onChange={(_, value: TabValue) => onTabChange(value)}
          variant="fullWidth"
          sx={{
            "& .MuiTabs-indicator": { display: "none" },
            "& .MuiTab-root": {
              color: "text.primary",
              textTransform: "none",
              fontWeight: 600,
              borderRight: `1px solid ${theme.palette.divider}`,
              "&:last-of-type": { borderRight: "none" },
              "&.Mui-selected": {
                color: "text.primary",
                bgcolor: theme.palette.action.selected,
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
                  <SearchIcon fontSize="small" sx={{ color: "text.primary" }} />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Очистить"
                    onClick={() => onQueryChange("")}
                    size="small"
                    sx={{ color: "text.primary" }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
          sx={{
            "& .MuiInputBase-root": { bgcolor: "background.default", borderRadius: 3 },
          }}
        />
      </Box>

      <Divider />

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
};

export default ChatSidebar;
export type { TabValue };