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
  } | null;
};

const NodeSidebar = ({ open, onClose, node }: NodeSidebarProps) => {
  const [tab, setTab] = useState<"materials" | "projects">("materials");
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  const title = node?.data?.label ?? "Навык";

  const description =
    node?.data?.description ??
    "Описание навыка пока не задано. Здесь будет краткое пояснение: что изучить и зачем это нужно. Описание навыка пока не задано. Здесь будет краткое пояснение: что изучить и зачем это нужно.";

  const materials = node?.data?.materials ?? [
    { title: "Ссылка 1", href: "#" },
    { title: "Ссылка 2", href: "#" },
    { title: "Ссылка 3", href: "#" },
  ];

  const projects = node?.data?.projects ?? [
    { title: "Проект 1", href: "#" },
    { title: "Проект 2", href: "#" },
  ];

  const list = tab === "materials" ? materials : projects;

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
        <Stack direction="column" spacing={2}>
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
                    alert(`Chat id: ${chatId}`);
                  } else {
                    alert("Chat ID is not available for this node.");
                  }
                } catch (error) {
                  console.error("Failed to resolve chat id", error);
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
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,.08)",
              background: "#181818",
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, v: "materials" | "projects") => setTab(v)}
              variant="fullWidth"
              sx={{
                "& .MuiTabs-indicator": { display: "none" },
                "& .MuiTab-root": {
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 600,
                  "&.Mui-selected": {
                    color: "#fff",
                    bgcolor: "#733E97",
                  },
                },
              }}
            >
              <Tab label="Материалы" value="materials" />
              <Tab label="Проекты" value="projects" />
            </Tabs>
          </Box>

          <Box
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,.08)",
              background: "#181818",
            }}
          >
            <List disablePadding>
              {list.map((item, i) => (
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
                      borderBottom:
                        i !== list.length - 1
                          ? "1px solid rgba(255,255,255,.12)"
                          : "none",
                      py: 1.25,
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
