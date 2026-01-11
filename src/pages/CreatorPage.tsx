import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  type EdgeChange,
  type Connection,
  Controls,
  useReactFlow,
  NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router-dom";

import { Box, Stack, CircularProgress } from "@mui/material";
import { Sidebar } from "../components/Sidebar";
import { RootState, useAppDispatch, useAppSelector } from "../store";
import { editorSliceActions } from "../store/slices/editorSlice";
import { Edge, Node } from "../types";
import { edgeTypes, nodeTypes } from "../consts";
import { NodeEditorSidebar } from "../components/NodeEditorSidebar";
import { roadmapService } from "../api/roadmap.service";

import { SwipeableDrawer, Fab, IconButton, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import { useNotification } from "../components/Notification/Notification";

import { parseModerationMessage } from "../utils/parseModerationMessage";

export const CreatorPage = () => {
  const { roadmap_id } = useParams();
  const dispatch = useAppDispatch();
  const { screenToFlowPosition } = useReactFlow();

  const { nodes, edges, editingNodeId } = useAppSelector(
    (state: RootState) => state.editor,
  );

  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const editingNode = useMemo(
    () => nodes.find((node) => node.id === editingNodeId) ?? null,
    [nodes, editingNodeId],
  );

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    if (!roadmap_id) return;
    setLoading(true);

    roadmapService
      .getGraph(roadmap_id)
      .then((data) => {
        const parsedNodes = data?.nodes ?? [];
        const parsedEdges = data?.edges ?? [];
        dispatch(editorSliceActions.setNodes(parsedNodes));
        dispatch(editorSliceActions.setEdges(parsedEdges));
      })
      .catch((e) => {
        console.error("Ошибка при загрузке roadmap:", e);
        dispatch(editorSliceActions.setNodes([]));
        dispatch(editorSliceActions.setEdges([]));
      })
      .finally(() => setLoading(false));
  }, [roadmap_id, dispatch]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      dispatch(editorSliceActions.setNodes(applyNodeChanges(changes, nodes))),
    [editorSliceActions, nodes, dispatch],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      dispatch(editorSliceActions.setEdges(applyEdgeChanges(changes, edges))),
    [dispatch, edges],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      dispatch(
        editorSliceActions.setEdges(
          addEdge(
            {
              ...connection,
              type: "solid",
              data: { variant: "solid" },
            },
            edges,
          ),
        ),
      );
    },
    [dispatch, edges],
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      dispatch(editorSliceActions.openNodeEditor(node.id));
    },
    [dispatch],
  );

  const handleEdgeClick = useCallback(
    (event: MouseEvent, edge: Edge) => {
      dispatch(editorSliceActions.markElementAsSelected(edge.id));
    },
    [editorSliceActions],
  );

  const addNode = (type: "primary" | "secondary" | "text") => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const flowPosition = screenToFlowPosition({ x: centerX, y: centerY });

    const newNode = {
      id: uuidv4(),
      type: type === "text" ? "text" : "custom",
      position: flowPosition,
      data: { label: `Нода новая`, type },
    };

    dispatch(editorSliceActions.addNode(newNode));
  };

  const handleCloseEditor = useCallback(() => {
    dispatch(editorSliceActions.closeNodeEditor());
    dispatch(editorSliceActions.markElementAsSelected(null));
  }, [dispatch]);

  const handleLabelChange = useCallback(
    (value: string) => {
      if (!editingNodeId) return;
      dispatch(
        editorSliceActions.updateNode({
          id: editingNodeId,
          data: { label: value },
        }),
      );
    },
    [dispatch, editingNodeId],
  );

  const handleDescriptionChange = useCallback(
    (value: string) => {
      if (!editingNodeId) return;

      dispatch(
        editorSliceActions.updateNode({
          id: editingNodeId,
          description: value,
        }),
      );
    },
    [dispatch, editingNodeId],
  );

  const { showNotification, Notification } = useNotification();

  const handleSave = useCallback(async () => {
    if (!roadmap_id) {
      showNotification("Невозможно сохранить: roadmap_id не найден", "error");
      return;
    }

    try {
      await roadmapService.updateGraph(roadmap_id, { nodes, edges });
      showNotification("Роадмап успешно сохранён!", "success");
    } catch (e) {
      console.error("Ошибка при сохранении:", e);
      const serverMessage = e?.response?.data?.message;

      const moderationReason = parseModerationMessage(serverMessage);

      if (
        typeof serverMessage === "string" &&
        serverMessage.includes("moderation")
      ) {
        showNotification(
          moderationReason
            ? `Модерация не пройдена: ${moderationReason}`
            : "Модерация не пройдена",
          "error",
        );
      } else {
        showNotification("Ошибка при сохранении роадмапа", "error");
      }
    }
  }, [roadmap_id, nodes, edges, showNotification]);

  const handleDeleteNode = useCallback(() => {
    if (!editingNodeId) return;

    const nodeId = editingNodeId;

    dispatch(editorSliceActions.setNodes(nodes.filter((n) => n.id !== nodeId)));

    dispatch(
      editorSliceActions.setEdges(
        edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      ),
    );

    dispatch(editorSliceActions.closeNodeEditor());
  }, [dispatch, editingNodeId, nodes, edges]);

  if (loading) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ height: "100vh" }}
      >
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack direction="row" sx={{ height: "100vh" }}>
      {!isMobile && <Sidebar addNode={addNode} />}
      <Box
        sx={{
          flex: 1,
          height: "100%",
          color: "#000",
          minWidth: 0,
        }}
        ref={containerRef}
      >
        <ReactFlow
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          deleteKeyCode={["Backspace", "Delete"]}
          onConnect={handleConnect}
          onPaneClick={() => {
            dispatch(editorSliceActions.closeNodeEditor());
            dispatch(editorSliceActions.markElementAsSelected(null));
          }}
          fitView
        >
          <Controls position="center-left" showZoom={false}></Controls>

          <Background color="#fff" bgColor="#000" />
        </ReactFlow>

        {isMobile && (
          <Fab
            onClick={() => void handleSave()}
            sx={{
              position: "absolute",
              right: 86,
              top: 70,
              zIndex: 20,
              color: "#fff",
              background: "linear-gradient(90deg, #7E57FF, #BC57FF)",
              boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
              "&:hover": {
                background: "linear-gradient(90deg, #6A49E6, #AA49E6)",
              },
              "&:active": {
                boxShadow: "0 6px 14px rgba(0,0,0,0.35)",
              },
            }}
          >
            <SaveIcon />
          </Fab>
        )}

        {isMobile && (
          <Fab
            color="primary"
            onClick={() => setToolsOpen(true)}
            sx={{
              position: "absolute",
              right: 16,
              top: 70,
              zIndex: 20,
              color: "#fff",
              background: "linear-gradient(90deg, #7E57FF, #BC57FF)",
              boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
              "&:hover": {
                background: "linear-gradient(90deg, #6A49E6, #AA49E6)",
              },
              "&:active": {
                boxShadow: "0 6px 14px rgba(0,0,0,0.35)",
              },
            }}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>
      <NodeEditorSidebar
        open={Boolean(editingNodeId)}
        node={editingNode}
        onClose={handleCloseEditor}
        onLabelChange={handleLabelChange}
        onDescriptionChange={handleDescriptionChange}
        onDelete={handleDeleteNode}
      />
      {isMobile && (
        <SwipeableDrawer
          anchor="bottom"
          open={toolsOpen}
          onClose={() => setToolsOpen(false)}
          onOpen={() => setToolsOpen(true)}
          disableSwipeToOpen
          ModalProps={{ keepMounted: true }}
          slotProps={{
            paper: {
              sx: {
                bgcolor: "#222222ff",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                maxHeight: "75vh",
                overflow: "auto",
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              },
            },
          }}
        >
          <Box
            sx={{
              pt: 1.25,
              pb: 1.25,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 5,
                borderRadius: 999,
                bgcolor: "rgba(255,255,255,0.35)",
              }}
            />
          </Box>

          <Box sx={{ px: 1, pb: 2 }}>
            <Sidebar addNode={addNode} variant="sheet" />
          </Box>
        </SwipeableDrawer>
      )}
      {Notification}
    </Stack>
  );
};
