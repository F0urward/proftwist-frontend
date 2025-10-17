import { useCallback, useEffect, useMemo, useRef } from "react";
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

import { Box, Stack } from "@mui/material";
import { Sidebar } from "../components/Sidebar";
import { RootState, useAppDispatch, useAppSelector } from "../store";
import { editorSliceActions } from "../store/slices/editorSlice";
import { Edge, Node } from "../types";
import { edgeTypes, nodeTypes } from "../consts";
import { NodeEditorSidebar } from "../components/NodeEditorSidebar";

export const CreatorPage = () => {
  const { nodes, edges, editingNodeId } = useAppSelector(
    (state: RootState) => state.editor,
  );

  useEffect(() => {
    const data = localStorage.getItem("flow");
    if (!data) return;

    console.log(data);

    const { nodes: storedNodes, edges: storedEdges } = JSON.parse(data);
    dispatch(editorSliceActions.setNodes(storedNodes));
    const normalizedEdges = Array.isArray(storedEdges)
      ? storedEdges.map((edge: any) => {
          const nextType =
            edge?.type === "dotted"
              ? "dashed"
              : ((edge?.type as string | undefined) ?? "solid");
          return {
            ...edge,
            type: nextType,
            data: {
              ...(edge?.data ?? {}),
              variant: nextType,
            },
          };
        })
      : [];
    dispatch(editorSliceActions.setEdges(normalizedEdges));
  }, []);

  const dispatch = useAppDispatch();

  const { screenToFlowPosition } = useReactFlow();

  const containerRef = useRef<HTMLDivElement>(null);

  const editingNode = useMemo(
    () => nodes.find((node) => node.id === editingNodeId) ?? null,
    [nodes, editingNodeId],
  );

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
    (event: MouseEvent, node: Node) => {
      dispatch(editorSliceActions.markElementAsSelected(node.id));
    },
    [editorSliceActions],
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

  return (
    <Stack direction="row" sx={{ height: "100vh" }}>
      <Sidebar addNode={addNode} />
      <Box
        sx={{ flex: 1, height: "100%", color: "#000", minWidth: 0 }}
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
          deleteKeyCode="Delete"
          onConnect={handleConnect}
          onPaneClick={() =>
            dispatch(editorSliceActions.markElementAsSelected(null))
          }
          fitView
        >
          <Controls position="center-left" showZoom={false}></Controls>

          <Background color="#fff" bgColor="#000" />
        </ReactFlow>
      </Box>
      <NodeEditorSidebar
        open={Boolean(editingNodeId)}
        node={editingNode}
        onClose={handleCloseEditor}
        onLabelChange={handleLabelChange}
      />
    </Stack>
  );
};
