import { useState, useCallback } from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import AddIcon from "@mui/icons-material/Add";
import { v4 as uuidv4 } from "uuid";
import { DottedEdge } from "../components/Edges";
import { CustomNode } from "../components/CustomNode";

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

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedElementId, setSelectedElementId] = useState(null);

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

  const addNode = () => {
    const newNode = {
      id: uuidv4(),
      type: "customNode",
      position: {
        x: Math.random() * 400, // случайная позиция по X
        y: Math.random() * 400, // случайная позиция по Y
      },
      data: { label: `Нода новая` },
      onUpdateLabel: updateNodeLabel,
    };

    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div style={{ width: "100vw", height: "100vh", color: "#000" }}>
      <ReactFlowProvider>
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
          <Controls position="center-left" showZoom={false}>
            <ControlButton onClick={addNode}>
              <AddIcon />
            </ControlButton>
          </Controls>
        </ReactFlow>

        <Background color="#fff" bgColor="#000" />
      </ReactFlowProvider>
    </div>
  );
}
