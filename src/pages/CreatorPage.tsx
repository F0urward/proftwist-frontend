import { useState, useCallback, useRef } from "react";
import {
  ReactFlow,
  applyNodeChanges,
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
import { DottedEdge } from "../components/Edges";
import { CustomNode } from "../components/CustomNode";
import { Button, Stack } from "@mui/material";
import { Sidebar } from "../components/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { editorSliceActions } from "../store/slices/editorSlice";
import { Edge, Node } from "../types";

const edgeTypes = {
  dotted: DottedEdge,
};

const nodeTypes = {
  custom: CustomNode,
};

export const CreatorPage = () => {
  const { nodes, edges, selectedElementId } = useSelector(
    (state: RootState) => state.editor
  );

  const dispatch = useDispatch<AppDispatch>();

  const { screenToFlowPosition } = useReactFlow();

  const containerRef = useRef<HTMLDivElement>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      dispatch(editorSliceActions.setNodes(applyNodeChanges(changes, nodes))),
    [editorSliceActions, nodes, dispatch]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      dispatch(editorSliceActions.setEdges(applyNodeChanges(edges, nodes))),
    [editorSliceActions, nodes, dispatch]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      dispatch(editorSliceActions.setEdges(addEdge(connection, edges)));
    },
    [dispatch, edges]
  );

  const handleNodeClick = useCallback(
    (event: MouseEvent, node: Node) => {
      dispatch(editorSliceActions.markElementAsSelected(node.id));
    },
    [editorSliceActions]
  );

  const handleEdgeClick = useCallback(
    (event: MouseEvent, edge: Edge) => {
      dispatch(editorSliceActions.markElementAsSelected(edge.id));
    },
    [editorSliceActions]
  );

  const addNode = (type: "primary" | "secondary") => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const flowPosition = screenToFlowPosition({ x: centerX, y: centerY });

    const newNode = {
      id: uuidv4(),
      type: "custom",
      position: flowPosition,
      data: { label: `Нода новая`, type },
    };

    dispatch(editorSliceActions.addNode(newNode));
  };

  return (
    <Stack direction="row">
      <Sidebar addNode={addNode} />
      <div
        style={{ width: "100vw", height: "100vh", color: "#000" }}
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
          onConnect={handleConnect}
          onPaneClick={() =>
            dispatch(editorSliceActions.markElementAsSelected(null))
          }
          fitView
        >
          <Controls position="center-left" showZoom={false}></Controls>

          <Background color="#fff" bgColor="#000" />
        </ReactFlow>
      </div>
    </Stack>
  );
};
