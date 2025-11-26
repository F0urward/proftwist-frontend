import { useState } from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { East } from "@mui/icons-material";
import { useAppSelector } from "../../store";
import { chatsService } from "../../api";
import { useNavigate } from "react-router-dom";

type NodeSidebarProps = {
  open: boolean;
  onClose: () => void;
  node?: {
    id: string;
    data?: {
      label?: string;
      description?: string;
      materials?: Array<{ title: string; href: string }>;
      projects?: Array<{ title: string; href: string }>;
    };
    description?: string;
  } | null;
};

const NodeSidebar = ({ open, onClose, node }: NodeSidebarProps) => {
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  const title = node?.data?.label ?? "Навык";

  const description =
    node?.description ??
    "Описание навыка пока не задано, но скоро появится! Заглядывайте сюда почаще :)";

  const materials = node?.data?.materials ?? [
    { title: "Ссылка 1", href: "#" },
    { title: "Ссылка 2", href: "#" },
    { title: "Ссылка 3", href: "#" },
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      keepMounted
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", md: 600 },
            bgcolor: "#212121",
            borderLeft: "1px solid rgba(255,255,255,.08)",
            boxShadow: "0 0 40px rgba(0,0,0,.45)",
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          },
        },
      }}
      ModalProps={{
        slotProps: {
          backdrop: {
            sx: {
              bgcolor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(2px)",
            },
          },
        },
      }}
    >
      <Box sx={{ p: { xs: 2.5, md: 3 }, position: "relative" }}>
        <Stack direction="column" spacing={4}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontFamily: '"TDAText", "Lato", sans-serif',
                backgroundImage: "linear-gradient(90deg, #BC57FF, #FF4DCA)",
                backgroundClip: "text",
                color: "transparent",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                paddingRight: "20px",
              }}
            >
              {title}
            </Typography>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: "#fff",
                position: "absolute",
                top: 20,
                right: 20,
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          <Typography variant="body1">{description}</Typography>

          {isLoggedIn && (
            <Button
              fullWidth
              variant="contained"
              onClick={async () => {
                if (!node?.id) {
                  alert("Chat ID is not available for this node.");
                  return;
                }
                try {
                  const { data } = await chatsService.getChatId(node.id);
                  const chatId =
                    data?.chat_id ?? data?.chatId ?? data?.id ?? data;
                  if (chatId) {
                    const targetChatId = String(chatId);
                    const alreadyMemberMessage =
                      "already a member of this chat";
                    const normalizeMessage = (
                      payload: unknown,
                    ): string | null => {
                      if (!payload) return null;
                      if (typeof payload === "string") return payload;
                      if (typeof payload === "object") {
                        const record = payload as Record<string, unknown>;
                        const candidate =
                          record.message ?? record.error ?? record.detail;
                        return typeof candidate === "string" ? candidate : null;
                      }
                      return null;
                    };
                    const isAlreadyMember = (message: string | null) =>
                      typeof message === "string" &&
                      message.toLowerCase() === alreadyMemberMessage;
                    const redirectToChat = () =>
                      navigate(
                        `/chats?chat=${encodeURIComponent(targetChatId)}`,
                      );

                    try {
                      const res =
                        await chatsService.joinGroupChat(targetChatId);
                      const responseMessage = normalizeMessage(res?.data);
                      if (
                        (res.status >= 200 && res.status < 300) ||
                        isAlreadyMember(responseMessage)
                      ) {
                        redirectToChat();
                        return;
                      }
                      alert("Failed joining chats");
                    } catch (joinError) {
                      const alreadyMemberResponse = normalizeMessage(
                        (joinError as any)?.response?.data,
                      );
                      if (isAlreadyMember(alreadyMemberResponse)) {
                        redirectToChat();
                        return;
                      }
                      throw joinError;
                    }
                  } else {
                    alert("Chat ID is not available for this node.");
                  }
                } catch (error) {
                  console.error("Failed to open chat for this node.", error);
                  alert("Failed to open chat for this node.");
                }
              }}
            >
              Перейти в чат
            </Button>
          )}

          <Box
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,.08)",
              background: "#181818",
              overflow: "hidden",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                m: 2,
                fontFamily: '"TDAText", "Lato", sans-serif',
                backgroundImage: "linear-gradient(90deg, #BC57FF, #FF4DCA)",
                backgroundClip: "text",
                color: "transparent",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textAlign: "center",
              }}
            >
              Материалы
            </Typography>

            <List disablePadding>
              {materials.map((item, i) => (
                <ListItem
                  key={`${item.title}-${i}`}
                  disablePadding
                  secondaryAction={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <East fontSize="small" />
                    </Box>
                  }
                >
                  <ListItemButton
                    component="a"
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      borderTop: "1px solid rgba(255,255,255,.12)",
                      py: 1.25,
                      "&:hover": {
                        backgroundColor: "rgba(188, 87, 255, 0.10)",
                      },
                    }}
                  >
                    <ListItemText
                      primary={item.title}
                      slotProps={{
                        primary: {
                          sx: { fontWeight: 500 },
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default NodeSidebar;
