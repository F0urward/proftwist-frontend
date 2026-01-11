import "@xyflow/react/dist/style.css";
import {
  Box,
  Button,
  Stack,
  Typography,
  Tooltip,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ReactFlow } from "@xyflow/react";
import { useEffect, useMemo, useState, useCallback } from "react";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  useNavigate,
  useParams,
  useLocation,
  Link as RouterLink,
} from "react-router-dom";
import { useAppDispatch, useAppSelector, RootState } from "../store";
import { viewSliceActions } from "../store/slices/viewSlice";
import { edgeTypes, nodeTypes } from "../consts";
import BaseLayout from "../components/BaseLayout/BaseLayout";
import TitlePaper from "../components/TitlePaper/TitlePaper";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import NodeSidebar from "../components/NodeSidebar/NodeSidebar";
import { RoadmapInfo } from "../types/roadmapinfo";
import { roadmapinfoService } from "../api/roadmapinfo.service";
import { roadmapService } from "../api/roadmap.service";
import { categoryService } from "../api/category.service";
import BookmarkAddOutlinedIcon from "@mui/icons-material/BookmarkAddOutlined";
import BookmarkRemoveOutlinedIcon from "@mui/icons-material/BookmarkRemoveOutlined";
import CallSplitOutlinedIcon from "@mui/icons-material/CallSplitOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeviceHubOutlinedIcon from "@mui/icons-material/DeviceHubOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useNotification } from "../components/Notification/Notification";
import CreateRoadmapInfoModal from "../components/CreateRoadmapsinfoModal/CreateRoadmapsinfoModal";
import { useRef } from "react";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

type RoadmapType = "public" | "owned" | "saved" | "fork";

const getProgress = (nodes: any[]) => {
  const total = nodes.length || 0;
  const done = nodes.filter((n) => n?.data?.done === true).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  return { done, total, percent };
};

const RoadmapPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [info, setInfo] = useState<RoadmapInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const [categoryName, setCategoryName] = useState<string>("");

  const { nodes, edges } = useAppSelector((s: RootState) => s.editor);

  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const closeSidebar = useCallback(() => setSelectedNode(null), []);

  const { showNotification, Notification } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const location = useLocation();
  const from = location.state?.from ?? null;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const isAuthor = useMemo(() => {
    if (!info || !currentUser) return false;
    return info.author?.user_id === currentUser.id;
  }, [info, currentUser]);

  const type: RoadmapType = useMemo(() => {
    if (!info) return "public";
    if (info.is_public) return "public";

    if (
      info.referenced_roadmap_info_id &&
      info.referenced_roadmap_info_id !== ""
    ) {
      return "fork";
    }

    if (isSubscribed) {
      return "saved";
    }

    return "owned";
  }, [info]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setNotFound(false);
        const data = await roadmapinfoService.getById(id!);
        if (!cancelled) setInfo(data ?? null);
      } catch {
        if (!cancelled) setInfo(null);
        setNotFound(true);
      } finally {
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!info?.category_id) return;

    async function loadCategory() {
      try {
        const category = await categoryService.getById(info.category_id);
        setCategoryName(category.name);
      } catch (e) {
        setCategoryName("Без категории");
      }
    }

    loadCategory();
  }, [info?.category_id]);

  useEffect(() => {
    const roadmapId = info?.roadmap_id;
    if (!roadmapId) return;

    dispatch(viewSliceActions.setNodes([]));
    dispatch(viewSliceActions.setEdges([]));

    let cancelled = false;

    async function loadFlow() {
      try {
        const flow = await roadmapService.getGraph(roadmapId);
        if (cancelled) return;

        if (!flow) {
          setNotFound(true);
          dispatch(viewSliceActions.setNodes([]));
          dispatch(viewSliceActions.setEdges([]));
          return;
        }

        dispatch(viewSliceActions.setNodes(flow.nodes ?? []));
        dispatch(viewSliceActions.setEdges(flow.edges ?? []));
      } catch {
        if (cancelled) return;
        dispatch(viewSliceActions.setNodes([]));
        dispatch(viewSliceActions.setEdges([]));
      }
    }

    loadFlow();
    return () => {
      cancelled = true;
    };
  }, [info?.roadmap_id, dispatch]);

  useEffect(() => {
    if (!info?.id || !isLoggedIn) return;

    async function check() {
      try {
        const subscribed = await roadmapinfoService.checkSubscription(info.id);
        setIsSubscribed(subscribed);
      } catch {
        setIsSubscribed(false);
      }
    }

    check();
  }, [info?.id, isLoggedIn]);

  const defaultEdgeOptions = useMemo(
    () => ({
      type: "smoothstep" as const,
      animated: false,
      style: { stroke: "#EDEDED", strokeWidth: 1.5 },
    }),
    [],
  );

  const styledNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: { ...n.data, readOnly: true },
      })),
    [nodes],
  );

  const handleSubscribe = async () => {
    if (!info?.id) return;
    try {
      const roadmapInfoId = info.id;
      await roadmapinfoService.subscribe(roadmapInfoId);
      showNotification("Роадмап добавлен в избранное!", "success");
      setIsSubscribed(true);
    } catch (e) {
      showNotification("Не удалось добавить роадмап в избранное", "error");
    }
  };

  const handleUnsubscribe = async () => {
    if (!info?.id) return;
    try {
      const roadmapInfoId = info.id;
      await roadmapinfoService.unsubscribe(roadmapInfoId);
      showNotification("Роадмап удалён из избранного", "success");
      setIsSubscribed(false);
    } catch (e) {
      showNotification("Не удалось удалить роадмап из избранного", "error");
    }
  };

  const handleFork = async () => {
    if (!info?.id) return;
    try {
      const roadmapInfoId = info.id;
      const newRoadmap = await roadmapinfoService.fork(roadmapInfoId);
      showNotification("Форк роадмапа успешно создан!", "success");
      navigate(`/roadmaps/${newRoadmap.id}`);
    } catch (e) {
      console.error("Ошибка при форке:", e);
      showNotification("Не удалось сделать форк", "error");
    }
  };

  const handlePublish = async () => {
    if (!info?.id) return;
    setConfirmOpen(true);
  };

  const confirmPublish = async () => {
    if (!info?.id) return;
    try {
      const newInfo = await roadmapinfoService.publish(info.id);
      showNotification("Роадмап успешно опубликован!", "success");

      navigate(`/roadmaps/${newInfo.id}`);
    } catch (e) {
      showNotification("Не удалось опубликовать роадмап", "error");
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!info?.id) return;
    try {
      await roadmapinfoService.delete(info.id);
      showNotification("Роадмап успешно удалён", "success");
      navigate("/personal");
    } catch (e) {
      showNotification("Не удалось удалить роадмап", "error");
    } finally {
      setDeleteOpen(false);
    }
  };

  const CategoryBadge = () => {
    if (!categoryName) return null;
    return (
      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          borderRadius: "8px",
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "uppercase",
          alignContent: "center",
          letterSpacing: "0.5px",
          width: "fit-content",
          background: "linear-gradient(90deg, #7E57FF, #BC57FF)",
          color: "#fff",
          boxShadow: "0 0 10px rgba(188,87,255,0.3)",
        }}
      >
        {categoryName}
      </Box>
    );
  };

  const AuthorBadge = () => {
    const username = info?.author?.username?.trim() ?? "";
    const avatarUrl = info?.author?.avatar_url;

    const label = username.length > 0 ? username : "ProfTwist";
    const isOfficial = username.length === 0;
    const finalLabel = isOfficial ? "ОФИЦИАЛЬНЫЙ РОАДМАП" : `АВТОР: ${label}`;

    return (
      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          borderRadius: "8px",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.3px",
          width: "fit-content",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {avatarUrl ? (
          <Box
            component="img"
            src={avatarUrl}
            alt={label}
            sx={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              flex: "0 0 auto",
            }}
          />
        ) : null}
        <span>{finalLabel}</span>
      </Box>
    );
  };

  const HeaderActions = () => {
    if (type === "public" && isLoggedIn) {
      return (
        <Stack direction="column" spacing={2} alignItems="center">
          <Stack
            direction="row"
            gap={1}
            flexWrap="wrap"
            sx={{ width: "100%", justifyContent: "center" }}
          >
            <CategoryBadge />
            <AuthorBadge />
          </Stack>
          <Stack
            direction="row"
            flexWrap={"wrap"}
            gap={4}
            alignItems="center"
            sx={{ width: "100%", justifyContent: "center", rowGap: 2 }}
          >
            {!isSubscribed && !isAuthor && (
              <Tooltip
                arrow
                title="Добавить роадмап в избранное для быстрого доступа и отслеживания прогресса"
              >
                <Button
                  variant="contained"
                  onClick={handleSubscribe}
                  startIcon={<BookmarkAddOutlinedIcon />}
                >
                  В избранное
                </Button>
              </Tooltip>
            )}
            {isSubscribed && (
              <Tooltip arrow title="Дайте этому роадмапу ещё один шанс :)">
                <Button
                  variant="contained"
                  onClick={handleUnsubscribe}
                  startIcon={<BookmarkRemoveOutlinedIcon />}
                >
                  Удалить из избранного
                </Button>
              </Tooltip>
            )}
            <Tooltip
              arrow
              title="Создать копию роадмапа, чтобы редактировать под себя"
            >
              <Button
                variant="contained"
                onClick={handleFork}
                startIcon={<CallSplitOutlinedIcon />}
              >
                Сделать форк
              </Button>
            </Tooltip>
          </Stack>
        </Stack>
      );
    }
    if (type === "owned" || type === "fork") {
      return (
        <Stack direction="column" spacing={2} alignItems="center">
          <Stack
            direction="row"
            gap={1}
            flexWrap="wrap"
            sx={{ width: "100%", justifyContent: "center" }}
          >
            <CategoryBadge />
            <AuthorBadge />
          </Stack>
          <Stack
            direction="row"
            flexWrap={"wrap"}
            gap={4}
            alignItems="center"
            sx={{ width: "100%", justifyContent: "center", rowGap: 2 }}
          >
            {/*<Stack sx={{ flex: 1 }} spacing={0.5}>
              <Typography variant="body1">
                Прогресс: {progress.done}/{progress.total} ({progress.percent}%)
              </Typography>
              <LinearProgress variant="determinate" value={progress.percent} 
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: "rgba(255,255,255,0.15)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 5,
                  background: "linear-gradient(90deg, #BC57FF 0%, #FF4DCA 100%)",
                },
              }}
            />
            </Stack>*/}
            <Button
              variant="contained"
              startIcon={<EditOutlinedIcon />}
              onClick={() => setModalOpen(true)}
            >
              Редактировать описание
            </Button>
            <Button
              variant="contained"
              startIcon={<DeviceHubOutlinedIcon />}
              onClick={() => {
                const roadmapId = info?.roadmap_id;
                if (roadmapId) {
                  navigate(`/roadmaps/${roadmapId}/edit`, {
                    state: { roadmapInfo: info },
                  });
                }
              }}
            >
              Редактировать роадмап
            </Button>
            <Tooltip
              arrow
              title="После публикации роадмап нельзя будет редактировать"
            >
              <Button
                variant="contained"
                onClick={handlePublish}
                startIcon={<PublicOutlinedIcon />}
              >
                Опубликовать
              </Button>
            </Tooltip>
            <CreateRoadmapInfoModal
              open={modalOpen}
              mode="edit"
              roadmapInfo={info}
              onClose={() => setModalOpen(false)}
              onSave={(updated) => {
                setInfo(updated);
                showNotification("Изменения сохранены", "success");
              }}
            />
            <Dialog
              open={confirmOpen}
              onClose={() => setConfirmOpen(false)}
              maxWidth="xs"
              fullWidth
            >
              <DialogTitle sx={{ textAlign: "center" }}>
                Подтвердите публикацию
              </DialogTitle>
              <DialogContent>
                <Typography>
                  Вы уверены, что хотите опубликовать роадмап?
                  <br />
                  <strong>
                    После публикации его нельзя будет редактировать.
                  </strong>
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setConfirmOpen(false)}>Отмена</Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={confirmPublish}
                >
                  Опубликовать
                </Button>
              </DialogActions>
            </Dialog>
          </Stack>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteOutlineOutlinedIcon />}
            onClick={() => setDeleteOpen(true)}
          >
            Удалить
          </Button>
          <Dialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle sx={{ textAlign: "center" }}>
              Удаление роадмапа
            </DialogTitle>
            <DialogContent>
              <Typography>
                Вы уверены, что хотите удалить этот роадмап?
                <br />
                Это действие <strong>нельзя будет отменить</strong>.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteOpen(false)}>Отмена</Button>
              <Button variant="contained" color="error" onClick={handleDelete}>
                Удалить
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>
      );
    }
  };

  const backLink = useMemo(() => {
    if (type === "owned" || type === "fork") {
      return { to: "/personal", label: "К моим роадмапам" };
    }

    if (type === "saved" || type === "public") {
      if (from === "personal") {
        return { to: "/personal", label: "К моим роадмапам" };
      } else {
        return { to: "/roadmaps", label: "Ко всем роадмапам" };
      }
    }

    return { to: "/roadmaps", label: "Ко всем роадмапам" };
  }, [type, from]);

  const titleText = notFound
    ? "Роадмап не найден"
    : info?.name ||
      (type === "public"
        ? "Официальный роадмап"
        : type === "owned"
          ? "Мой роадмап"
          : "Сохранённый роадмап");

  const subtitleText = notFound
    ? "На странице роадмапов вы точно найдете то, что ищете"
    : info?.description ||
      (type === "public"
        ? "Изучите профессию по проверенному плану"
        : type === "owned"
          ? "Ваш персональный план: можно редактировать и отслеживать прогресс"
          : "Вы сохранили этот роадмап и отслеживаете прогресс");

  const showFlow = !notFound && (nodes.length > 0 || edges.length > 0);

  const [flowHeight, setFlowHeight] = useState(800);
  const flowInstance = useRef<any>(null);

  const updateHeight = useCallback(() => {
    const inst = flowInstance.current;
    if (!inst) return;

    const bounds = inst.getInternalNodeBounds?.();
    if (!bounds) return;

    const padding = 200;
    const finalHeight = Math.max(600, bounds.height + padding);

    setFlowHeight(finalHeight);
  }, []);

  const onFlowInit = useCallback(
    (instance: any) => {
      flowInstance.current = instance;

      instance.fitView({ padding: 0.1 });

      setTimeout(() => {
        updateHeight();
        instance.setViewport(instance.getViewport());
      }, 150);
    },
    [updateHeight],
  );

  useEffect(() => {
    updateHeight();
  }, [styledNodes, edges, updateHeight]);

  useEffect(() => {
    const handler = () => updateHeight();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [updateHeight]);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (!isMobile) return;

    const onScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <BaseLayout justifyContent="flex-start" py={4}>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          width: "100%",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Button
          component={RouterLink}
          to={backLink.to}
          startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 6 }} />}
          sx={{
            position: "absolute",
            top: { xs: -35, md: 0 },
            left: { xs: 0, md: 12 },
            zIndex: 1,
            textTransform: "none",
          }}
          variant="text"
        >
          {backLink.label}
        </Button>
        <TitlePaper title={titleText} subtitle={subtitleText}>
          {!notFound && <HeaderActions />}
        </TitlePaper>
      </Box>

      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: `${flowHeight}px`,
          overflow: "visible",
          transition: "height 0.25s ease",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 10,
            display: "flex",
            gap: 1,
          }}
        >
          <Button
            onClick={() => flowInstance.current?.fitView({ padding: 0.1 })}
            startIcon={<CenterFocusStrongIcon />}
            sx={{
              textTransform: "none",
              fontSize: "0.75rem",
              borderRadius: "8px",
              px: 1.5,
              py: 0.5,
              background: "linear-gradient(90deg, #7E57FF, #BC57FF)",
              color: "#fff",
              "&:hover": {
                background: "linear-gradient(90deg, #6A49E6, #AA49E6)",
              },
            }}
          >
            Сбросить вид
          </Button>
          <Tooltip
            arrow
            placement={isMobile ? "bottom" : "right"}
            enterTouchDelay={0}
            leaveTouchDelay={4000}
            title={
              <>
                <b>Как управлять роадмапом:</b>
                <br /> Масштабирование: pinch (телефон, тачпад) / Ctrl + колесо
                мыши <br />
                Перемещение карты:
                <br />— Мышь: зажмите правую кнопку и тяните
                <br />— Тачпад: тяните двумя пальцами
                <br />— Телефон: тяните двумя пальцами
                <br />
                Скролл страницы остаётся обычным
              </>
            }
          >
            <Button
              disableRipple
              sx={{
                minWidth: "auto",
                padding: 0,
                background: "transparent",
                border: "none",
                boxShadow: "none",
                "&:hover": {
                  background: "transparent",
                },
                "&::before, &::after": {
                  display: "none",
                },
              }}
            >
              <HelpOutlineIcon sx={{ color: "#fff", fontSize: 22 }} />
            </Button>
          </Tooltip>
        </Box>
        {showFlow && (
          <ReactFlow
            nodes={styledNodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            fitViewOptions={{ padding: 0.05 }}
            minZoom={0.25}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
            onInit={onFlowInit}
            preventScrolling={false}
            zoomOnScroll={false}
            zoomOnPinch={true}
            panOnScroll={false}
            panOnDrag={[1, 2]}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            connectOnClick={false}
            style={{
              position: "absolute",
              inset: 0,
              background: "transparent",
            }}
            onNodeClick={(_, node) => {
              setSelectedNode(node);
            }}
          />
        )}

        <NodeSidebar
          open={!!selectedNode}
          node={selectedNode}
          roadmapId={info?.roadmap_id ?? ""}
          onClose={closeSidebar}
          type={type}
          notify={showNotification}
        />
      </Box>
      {isMobile && showScrollTop && (
        <Button
          onClick={scrollToTop}
          variant="contained"
          sx={{
            position: "fixed",
            right: 14,
            bottom: "calc(env(safe-area-inset-bottom) + 14px)",
            zIndex: 1200,
            minWidth: 44,
            width: 44,
            height: 44,
            borderRadius: "999px",
            padding: 0,
            background: "linear-gradient(90deg, #7E57FF, #BC57FF)",
            boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
            "&:hover": {
              background: "linear-gradient(90deg, #6A49E6, #AA49E6)",
            },
          }}
        >
          <KeyboardArrowUpIcon />
        </Button>
      )}

      {Notification}
    </BaseLayout>
  );
};

export default RoadmapPage;
