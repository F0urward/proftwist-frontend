import { useState } from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Avatar,
  Tooltip,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { East } from "@mui/icons-material";
import { useAppSelector } from "../../store";
import { chatsService } from "../../api";
import { useNavigate } from "react-router-dom";
import { materialsService } from "../../api/material.service";
import { Material } from "../../types/material";
import { useEffect, useMemo } from "react";
import AddMaterialModal from "../AddMaterialModal/AddMaterialModal";
import ConfirmModal from "../ConfirmModal/ConfirmModal";

import { FormControl, InputLabel, MenuItem, Select, Chip } from "@mui/material";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import RedoRoundedIcon from "@mui/icons-material/RedoRounded";

import { roadmapService } from "../../api/roadmap.service";
import { NodeProgressStatus } from "../../types/nodeProgressStatus";

type RoadmapType = "public" | "owned" | "saved" | "fork";

const PROGRESS_OPTIONS: Array<{
  value: NodeProgressStatus;
  label: string;
  icon: React.ReactElement;
  iconColor: string;
}> = [
  {
    value: "ожидает",
    label: "Ожидает",
    icon: <HourglassEmptyRoundedIcon />,
    iconColor: "rgba(255,255,255,0.65)",
  },
  {
    value: "в процессе",
    label: "В процессе",
    icon: <BoltRoundedIcon />,
    iconColor: "#7E57FF",
  },
  {
    value: "завершено",
    label: "Завершено",
    icon: <CheckRoundedIcon />,
    iconColor: "#00C878",
  },
  {
    value: "пропущено",
    label: "Пропущено",
    icon: <RedoRoundedIcon />,
    iconColor: "#FFB400",
  },
];

const isProgressStatus = (v: any): v is NodeProgressStatus =>
  v === "ожидает" ||
  v === "в процессе" ||
  v === "завершено" ||
  v === "пропущено";

type NodeSidebarProps = {
  open: boolean;
  onClose: () => void;
  node: {
    id: string;
    data?: {
      label?: string;
      description?: string;
      materials?: Array<{ title: string; href: string }>;
      projects?: Array<{ title: string; href: string }>;
    };
    progress?: { status?: NodeProgressStatus };
    description?: string;
  };
  roadmapId: string;
  type: RoadmapType;
  notify: (message: string, type?: "success" | "error") => void;
  onProgressUpdated?: (nodeId: string, status: NodeProgressStatus) => void;
};

const NodeSidebar = ({
  open,
  onClose,
  node,
  roadmapId,
  type,
  notify,
  onProgressUpdated,
}: NodeSidebarProps) => {
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const [materialModal, setMaterialModal] = useState(false);
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(
    null,
  );
  const initialStatus: NodeProgressStatus = useMemo(() => {
    const s = (node as any)?.progress?.status;
    return isProgressStatus(s) ? s : "ожидает";
  }, [node?.progress?.status]);

  const [progressStatus, setProgressStatus] =
    useState<NodeProgressStatus>(initialStatus);

  const [isSavingProgress, setIsSavingProgress] = useState(false);

  const title = node?.data?.label ?? "Навык";

  const description =
    node?.description ??
    "Описание навыка пока не задано, но скоро появится! Заглядывайте сюда почаще :)";

  const [materials, setMaterials] = useState<Material[]>([]);

  const progressOptionByValue = useMemo(() => {
    return Object.fromEntries(
      PROGRESS_OPTIONS.map((o) => [o.value, o]),
    ) as Record<NodeProgressStatus, (typeof PROGRESS_OPTIONS)[number]>;
  }, []);

  const currentProgressOption = progressOptionByValue[progressStatus];

  useEffect(() => {
    if (!open || !node?.id) return;

    async function load() {
      try {
        const data = await materialsService.getByNode(roadmapId, node.id);
        setMaterials(data);
      } catch (e) {
        console.error("Failed to load materials for node", e);
        setMaterials([]);
      }
    }

    load();
  }, [open, node?.id]);

  useEffect(() => {
    setProgressStatus(initialStatus);
  }, [initialStatus]);

  const handleDelete = async () => {
    if (!materialToDelete) return;

    try {
      await materialsService.delete(roadmapId, node.id, materialToDelete.id);
      setMaterials((prev) => prev.filter((m) => m.id !== materialToDelete.id));
      notify("Материал удалён", "success");
    } catch {
      notify("Не удалось удалить материал", "error");
    }

    setDeleteOpen(false);
    setMaterialToDelete(null);
  };

  const handleChangeProgress = async (next: NodeProgressStatus) => {
    if (!node?.id) return;

    setProgressStatus(next);
    setIsSavingProgress(true);

    try {
      await roadmapService.updateNodeProgress(roadmapId, node.id, next);
      onProgressUpdated?.(node.id, next);
      notify("Статус обновлён", "success");
    } catch (e) {
      console.error("Failed to update node progress", e);
      notify("Не удалось обновить статус", "error");

      setProgressStatus(initialStatus);
    } finally {
      setIsSavingProgress(false);
    }
  };

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

          {isLoggedIn && (type === "public" || type === "saved") && (
            <Button
              fullWidth
              variant="contained"
              onClick={async () => {
                if (!node?.id) {
                  alert("Идентификатор чата для этой ноды недоступен.");
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
                      alert("Не удалось подключиться к чату");
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
                    alert("Идентификатор чата для этой ноды недоступен.");
                  }
                } catch (error) {
                  console.error("Failed to open chat for this node.", error);
                  alert("Не удалось открыть чат для этой ноды.");
                }
              }}
            >
              Перейти в чат
            </Button>
          )}

          {isLoggedIn && (
            <Box
              sx={{
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,.08)",
                background: "#181818",
                p: 2,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mb: 2.5 }}
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
                  Прогресс
                </Typography>
              </Stack>

              <FormControl fullWidth size="small" disabled={isSavingProgress}>
                <InputLabel id="node-progress-label">Статус</InputLabel>
                <Select
                  labelId="node-progress-label"
                  value={progressStatus}
                  label="Статус"
                  onChange={(e) =>
                    handleChangeProgress(e.target.value as NodeProgressStatus)
                  }
                  renderValue={(value) => {
                    const opt =
                      progressOptionByValue[value as NodeProgressStatus];
                    return (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            display: "grid",
                            placeItems: "center",
                            color: opt.iconColor,
                            "& svg": { fontSize: 18 },
                          }}
                        >
                          {opt.icon}
                        </Box>
                        <span>{opt.label}</span>
                      </Stack>
                    );
                  }}
                  sx={{
                    color: "#fff",
                    ".MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,.18)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,.28)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#BC57FF",
                    },
                    ".MuiSelect-icon": { color: "rgba(255,255,255,.7)" },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: "#1b1b1b",
                        border: "1px solid rgba(255,255,255,.08)",
                        "& .MuiMenuItem-root": { color: "#fff" },
                      },
                    },
                  }}
                >
                  {PROGRESS_OPTIONS.map((opt) => {
                    const selected = progressStatus === opt.value;

                    return (
                      <MenuItem key={opt.value} value={opt.value}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              display: "grid",
                              placeItems: "center",
                              color: opt.iconColor,
                              "& svg": { fontSize: 18 },
                            }}
                          >
                            {opt.icon}
                          </Box>

                          <span>{opt.label}</span>

                          {selected ? (
                            <Box
                              sx={{
                                ml: "auto",
                                width: 8,
                                height: 8,
                                borderRadius: "999px",
                                background: opt.iconColor,
                                boxShadow: `0 0 10px ${opt.iconColor}`,
                                opacity: 0.9,
                              }}
                            />
                          ) : null}
                        </Stack>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              {isSavingProgress ? (
                <Typography sx={{ mt: 1, fontSize: "0.85rem", opacity: 0.8 }}>
                  Сохраняем статус…
                </Typography>
              ) : null}
            </Box>
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
                textAlign: "left",
                width: "fit-content",
              }}
            >
              Материалы
            </Typography>

            {materials.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 2,
                  px: 2,
                  color: "#fff",
                  fontSize: "0.95rem",
                  borderTop: "1px solid rgba(255,255,255,.12)",
                }}
              >
                <Typography sx={{ mb: 1 }}>
                  Здесь пока нет материалов
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", opacity: 0.8 }}>
                  Но вы всегда можете добавить свои материалы
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {materials.map((item, i) => {
                  const isAuthor = item.author?.id === currentUserId;

                  return (
                    <ListItem
                      key={`${item.name}-${i}`}
                      disablePadding
                      secondaryAction={
                        isAuthor ? (
                          <Tooltip
                            title="Автор может удалить свой материал"
                            arrow
                          >
                            <IconButton
                              edge="end"
                              onClick={() => {
                                setMaterialToDelete(item);
                                setDeleteOpen(true);
                              }}
                              sx={{
                                color: "rgba(255,255,255,0.7)",
                                "&:hover": { color: "#FF4DCA" },
                              }}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              height: "100%",
                            }}
                          >
                            <East fontSize="small" />
                          </Box>
                        )
                      }
                    >
                      <ListItemButton
                        component="a"
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          borderTop: "1px solid rgba(255,255,255,.12)",
                          py: 2,
                          "&:hover": {
                            backgroundColor: "rgba(188, 87, 255, 0.10)",
                          },
                        }}
                      >
                        <Stack
                          direction="column"
                          sx={{ width: "100%" }}
                          spacing={0.5}
                        >
                          <Typography sx={{ fontWeight: 500 }}>
                            {item.name}
                          </Typography>

                          {item.author && (
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Avatar
                                alt={item.author.username
                                  .charAt(0)
                                  .toUpperCase()}
                                src={item.author.avatar_url}
                                sx={{ width: 30, height: 30 }}
                              />
                              <Typography
                                sx={{
                                  fontSize: "0.8rem",
                                  color: "rgba(255,255,255,0.6)",
                                }}
                              >
                                {item.author.username}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            )}
            <ConfirmModal
              open={deleteOpen}
              onClose={() => setDeleteOpen(false)}
              onConfirm={handleDelete}
              title="Удаление материала"
              message={
                <>
                  Вы уверены, что хотите удалить материал:
                  <br />
                  <strong>{materialToDelete?.name}</strong>?
                  <br />
                  Это действие <strong>нельзя будет отменить</strong>.
                </>
              }
              confirmText="Удалить"
              confirmColor="error"
            />
          </Box>
          {isLoggedIn && (
            <>
              <Button
                variant="contained"
                onClick={() => setMaterialModal(true)}
              >
                Добавить материал
              </Button>
              <AddMaterialModal
                open={materialModal}
                roadmapId={roadmapId}
                nodeId={node?.id}
                onClose={() => setMaterialModal(false)}
                onSave={(mat) => setMaterials((prev) => [mat, ...prev])}
                notify={notify}
              />
            </>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
};

export default NodeSidebar;
