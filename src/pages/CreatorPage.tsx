import { useState, useCallback, useRef } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  type EdgeChange,
  type Connection,
  ReactFlowProvider,
  Controls,
  ControlButton,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { v4 as uuidv4 } from "uuid";
import { DottedEdge } from "../components/Edges";
import { CustomNode } from "../components/CustomNode";
import { Button, Stack } from "@mui/material";
import { Sidebar } from "../components/Sidebar";

const edgeTypes = {
  dotted: DottedEdge,
};

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes = [
  {
    id: "n1",
    position: { x: 0, y: 0 },
    data: { label: "Навык 1", type: "primary" },
    type: "custom",
  },
  {
    id: "n0",
    position: { x: 200, y: 0 },
    data: { label: "DevOps", type: "root" },
    type: "custom",
  },
  {
    id: "n4",
    position: { x: -100, y: 200 },
    data: { label: "Optional Node", type: "secondary" },
    type: "custom",
  },
];
const initialEdges = [
  {
    id: "n1-n4",
    type: "dotted",
    source: "n1",
    target: "n4",
    style: { stroke: "#222", strokeDasharray: "5 5" },
  },
];

export const CreatorPage = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedElementId, setSelectedElementId] = useState(null);

  const { screenToFlowPosition } = useReactFlow();

  const containerRef = useRef<HTMLDivElement>(null);

  const onNodesChange = useCallback(
    (changes) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange<any>[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );

  const updateNodeLabel = (id: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      )
    );
  };

  const handleNodeClick = (event, node) => {
    setSelectedElementId(node.id);
  };

  const handleEdgeClick = (event, edge) => {
    setSelectedElementId(edge.id);
  };

  // Обновляем data у нод при изменении selectedElementId
  const nodesWithSelection = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data, // ← распыляем старые данные
      isSelected: node.id === selectedElementId, // ← добавляем/перезаписываем isSelected
    },
  }));

  const edgesWithSelection = edges.map((edge) => ({
    ...edge,
    data: {
      ...edge.data,
      isSelected: edge.id === selectedElementId,
    },
  }));

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
      onUpdateLabel: updateNodeLabel,
    };

    setNodes((nds) => nds.concat(newNode));
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
          nodes={nodesWithSelection}
          edges={edgesWithSelection}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onConnect={onConnect}
          onPaneClick={() => setSelectedElementId(null)}
          fitView
        >
          <Controls position="center-left" showZoom={false}></Controls>

          <Background color="#fff" bgColor="#000" />
        </ReactFlow>
      </div>
    </Stack>
  );
};
