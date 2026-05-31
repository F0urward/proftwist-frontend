import { Avatar, Badge, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { Chat } from "../../types/chat";
import { getChatAvatar } from "../../utils/chat-utils";

type ChatListItemProps = {
  chat: Chat;
  isSelected: boolean;
  onSelect: () => void;
  currentUserId: string;
};

const ChatListItem = ({ chat, isSelected, onSelect, currentUserId }: ChatListItemProps) => {
  const theme = useTheme();
  const avatar = getChatAvatar(chat, currentUserId);
  const hasSrc = "src" in avatar;

  return (
    <ListItem
      disablePadding
      sx={{
        "&:not(:last-of-type) .MuiListItemButton-root": {
          borderBottom: `1px solid ${theme.palette.divider}`,
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
          "&.Mui-selected": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
        }}
      >
        <ListItemAvatar sx={{ alignSelf: "center" }}>
          <Badge
            overlap="circular"
            badgeContent={chat.unread || 0}
            invisible={!chat.unread}
            sx={{ "& .MuiBadge-badge": { bgcolor: "secondary.main" } }}
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
              color: alpha(theme.palette.text.primary, 0.75),
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

export default ChatListItem;