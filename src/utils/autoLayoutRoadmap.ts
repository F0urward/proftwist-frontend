import {
  Graph,
  layout,
  type EdgeLabel,
  type GraphLabel,
  type NodeLabel,
} from "@dagrejs/dagre";
import type { Edge as FlowEdge, Node } from "@xyflow/react";

const NODE_WIDTH = 180;
const TEXT_NODE_WIDTH = 220;
const NODE_HEIGHT = 70;
const ROOT_NODE_HEIGHT = 90;
const TEXT_NODE_HEIGHT = 40;
const LAYER_GAP = 70;
const NODE_GAP = 90;

const getNodeWidth = (node: Node) =>
  node.type === "text" ? TEXT_NODE_WIDTH : NODE_WIDTH;

const getNodeHeight = (node: Node) => {
  const nodeType = (node.data as any)?.type;

  if (node.type === "text") return TEXT_NODE_HEIGHT;
  if (nodeType === "root") return ROOT_NODE_HEIGHT;

  return NODE_HEIGHT;
};

export const autoLayoutRoadmap = <TNode extends Node, TEdge extends FlowEdge>(
  nodes: TNode[],
  edges: TEdge[],
): TNode[] => {
  if (nodes.length <= 1) return nodes;

  const graph = new Graph<GraphLabel, NodeLabel, EdgeLabel>({
    multigraph: true,
  })
    .setGraph({
      rankdir: "TB",
      nodesep: NODE_GAP,
      ranksep: LAYER_GAP,
      marginx: 0,
      marginy: 0,
    })
    .setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    graph.setNode(node.id, {
      width: getNodeWidth(node),
      height: getNodeHeight(node),
    });
  });

  const nodeIds = new Set(nodes.map((node) => node.id));
  edges.forEach((edge) => {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) return;

    graph.setEdge(edge.source, edge.target, {}, edge.id);
  });

  layout(graph);

  return nodes.map((node) => {
    const layoutNode = graph.node(node.id);
    const width = getNodeWidth(node);
    const height = getNodeHeight(node);

    return {
      ...node,
      position: {
        x: Math.round((layoutNode.x ?? 0) - width / 2),
        y: Math.round((layoutNode.y ?? 0) - height / 2),
      },
    };
  }) as TNode[];
};
