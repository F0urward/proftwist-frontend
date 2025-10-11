import "@xyflow/react/dist/style.css";
import { Box, Button, Stack, LinearProgress, Typography } from "@mui/material";
import { ReactFlow } from "@xyflow/react";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation, Link as RouterLink } from "react-router-dom";
import { useAppDispatch, useAppSelector, RootState } from "../store";
import { viewSliceActions } from "../store/slices/viewSlice";
import { edgeTypes, nodeTypes } from "../consts";
import BaseLayout from "../components/BaseLayout/BaseLayout";
import TitlePaper from "../components/TitlePaper/TitlePaper";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

type RoadmapType = "official" | "owned" | "saved";

const estimateGraphHeight = (nodes: any[], fallback = 600) => {
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

  const searchParams = new URLSearchParams(location.search);
  const routeKind = (location.state as any)?.type as RoadmapType | undefined;
  const queryKind = (searchParams.get("type") as RoadmapType) || undefined;
  const type: RoadmapType = routeKind ?? queryKind ?? "official";

  const { nodes, edges } = useAppSelector((s: RootState) => s.editor);

  useEffect(() => {
    const raw = localStorage.getItem("flow");
    if (!raw) return;
    const { nodes, edges } = JSON.parse(raw);
    dispatch(viewSliceActions.setNodes(nodes));
    dispatch(viewSliceActions.setEdges(edges));
  }, [dispatch, id]);

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

  return (
    <BaseLayout>
      <Box sx={{ position: "relative", display: "flex", width: "100%", justifyContent: "center" }}>
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
            title={type === "official" ? "Официальный роадмап" : type === "owned" ? "Мой роадмап" : "Сохранённый роадмап"}
            subtitle={
            type === "official"
                ? "Изучите профессию по проверенному плану"
                : type === "owned"
                ? "Ваш персональный план: можно редактировать и отслеживать прогресс"
                : "Вы сохранили этот роадмап и отслеживаете прогресс"
            }
        >
          <HeaderActions />
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
        ></ReactFlow>
      </Box>
    </BaseLayout>
  );
};

export default RoadmapPage;
