import { v4 as uuidv4 } from "uuid";
import type { Node, Edge } from "@xyflow/react";

interface LlmNode {
  label: string;
  description?: string;
  node_type?: string;
}

interface LlmConnection {
  from: string;
  to: string;
}

interface LlmRoadmap {
  nodes: LlmNode[];
  connections: LlmConnection[];
}

interface RawRoadmap {
  roadmap?: { nodes?: unknown[]; edges?: unknown[] };
  nodes?: unknown[];
  edges?: unknown[];
  connections?: LlmConnection[];
}

const isLlmFormat = (data: RawRoadmap): boolean => {
  const nodes = data.nodes;
  if (!Array.isArray(nodes) || nodes.length === 0) return false;

  const firstNode = nodes[0] as Record<string, unknown>;
  return (
    typeof firstNode.label === "string" &&
    firstNode.node_type !== undefined &&
    Array.isArray(data.connections)
  );
};

const isReactFlowFormat = (data: RawRoadmap): boolean => {
  const nodes = data.nodes ?? data.roadmap?.nodes;
  if (!Array.isArray(nodes) || nodes.length === 0) return false;

  const firstNode = nodes[0] as Record<string, unknown>;
  return (
    typeof firstNode.id === "string" &&
    firstNode.type !== undefined &&
    firstNode.data !== undefined
  );
};

export const convertLlmToReactFlow = (llmJson: LlmRoadmap): Roadmap => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const idMap: Record<string, string> = {};

  llmJson.nodes.forEach((node) => {
    const id = uuidv4();
    idMap[node.label] = id;

    nodes.push({
      id,
      type: "custom",
      description: node.description,
      data: {
        label: node.label,
        type: node.node_type,
      },
      position: { x: 0, y: 0 },
    });
  });

  llmJson.connections.forEach((conn) => {
    const sourceId = idMap[conn.from];
    const targetId = idMap[conn.to];

    if (sourceId && targetId) {
      edges.push({
        source: sourceId,
        target: targetId,
        id: uuidv4(),
      });
    }
  });

  return { nodes, edges };
};

export const convertRawRoadmap = (raw: RawRoadmap): Roadmap => {
  if (isReactFlowFormat(raw)) {
    const nodes = (raw.roadmap?.nodes ?? raw.nodes ?? []) as Node[];
    const edges = (raw.roadmap?.edges ?? raw.edges ?? []) as Edge[];
    return { nodes, edges };
  }

  if (isLlmFormat(raw)) {
    return convertLlmToReactFlow(raw as unknown as LlmRoadmap);
  }

  const nodes = (raw.nodes ?? []) as Node[];
  const edges = (raw.edges ?? []) as Edge[];

  return { nodes, edges };
};