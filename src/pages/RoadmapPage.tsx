import "@xyflow/react/dist/style.css";
import { Box, Button, Stack, LinearProgress, Typography } from "@mui/material";
import { ReactFlow } from "@xyflow/react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation, Link as RouterLink } from "react-router-dom";
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

type RoadmapType = "official" | "owned" | "saved";

const estimateGraphHeight = (nodes: any[], fallback = 100) => {
  if (!nodes.length) return fallback;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    const y = n.position?.y ?? 0;
    const h = n.measured?.height ?? n.height ?? 80;
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y + h);
  }
  return Math.max(fallback, maxY - minY + 200);
};

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
  const location = useLocation();

  const incoming = (location.state as any)?.roadmap as RoadmapInfo | undefined;
  const [info, setInfo] = useState<RoadmapInfo | null>(incoming ?? null);
  const [notFound, setNotFound] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const routeKind = (location.state as any)?.type as RoadmapType | undefined;
  const queryKind = (searchParams.get("type") as RoadmapType) || undefined;
  const type: RoadmapType = routeKind ?? queryKind ?? "official";

  const { nodes, edges } = useAppSelector((s: RootState) => s.editor);
  
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const closeSidebar = useCallback(() => setSelectedNode(null), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (incoming) {
        return;
      }
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
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    const roadmapId = info?.roadmap_id ?? incoming?.roadmap_id;
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
    return () => { cancelled = true; };
  }, [info?.roadmap_id, incoming?.roadmap_id, dispatch]);

  const defaultEdgeOptions = useMemo(
    () => ({
      type: "smoothstep" as const,
      animated: false,
      style: { stroke: "#EDEDED", strokeWidth: 1.5 },
    }),
    []
  );

  const styledNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: { ...n.data, readOnly: true },
      })),
    [nodes]
  );

  const graphHeight = useMemo(() => estimateGraphHeight(styledNodes), [styledNodes]);
  const progress = useMemo(() => getProgress(styledNodes), [styledNodes]);

  const HeaderActions = () => {
    if (type === "official") {
      return (
        <Button variant="contained" onClick={() => navigate(`/personal`)}>
          Начать изучение
        </Button>
      );
    }
    if (type === "owned") {
      return (
        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>
          <Stack sx={{ flex: 1 }} spacing={0.5}>
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
          </Stack>
          <Button variant="contained" onClick={() => navigate(`/`)}>
            Редактировать
          </Button>
        </Stack>
      );
    }
    return (
      <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>
        <Stack sx={{ flex: 1 }} spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            Прогресс: {progress.done}/{progress.total} ({progress.percent}%)
          </Typography>
          <LinearProgress variant="determinate" value={progress.percent} />
        </Stack>
      </Stack>
    );
  };

  const backLink =
    type === "official"
      ? { to: "/roadmaps", label: "Ко всем роадмапам" }
      : { to: "/personal", label: "К моим роадмапам" };

  const titleText = notFound
    ? "Роадмап не найден"
    : (info?.name) ||
    (type === "official" ? "Официальный роадмап" : type === "owned" ? "Мой роадмап" : "Сохранённый роадмап");

  const subtitleText = notFound
    ? "На странице роадмапов вы точно найдете то, что ищете"
    : (info?.description) ||
    (type === "official"
      ? "Изучите профессию по проверенному плану"
      : type === "owned"
      ? "Ваш персональный план: можно редактировать и отслеживать прогресс"
      : "Вы сохранили этот роадмап и отслеживаете прогресс");

  const showFlow = !notFound && (nodes.length > 0 || edges.length > 0);

  return (
    <BaseLayout justifyContent="flex-start">
      <Box sx={{ position: "relative", display: "flex", width: "100%", justifyContent: "center", alignItems: "flex-start" }}>
        <Button
          component={RouterLink}
          to={backLink.to}
          startIcon={<ArrowBackIosNewIcon fontSize="small" />}
          sx={{
            position: "absolute",
            left: { md: 12 },
            zIndex: 1,
            textTransform: "none",
          }}
          variant="text"
        >
          {backLink.label}
        </Button>
        <TitlePaper
            title={titleText}
            subtitle={subtitleText}
        >
          {!notFound && (
            <HeaderActions />
          )}
        </TitlePaper>
      </Box>
      
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: graphHeight,
          overflow: "visible",
        }}
      >
        { showFlow && (
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
            preventScrolling={false}
            zoomOnScroll={false}
            zoomOnPinch={true}
            panOnScroll={false}
            panOnDrag={false} 
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            connectOnClick={false}
            style={{ position: "absolute", inset: 0, background: "transparent" }}
            onNodeClick={(_, node) => setSelectedNode(node)}
          ></ReactFlow>
        )}
        <NodeSidebar open={!!selectedNode} node={selectedNode} onClose={closeSidebar} />
      </Box>
    </BaseLayout>
  );
};

export default RoadmapPage;
