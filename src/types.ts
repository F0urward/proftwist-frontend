export interface NodeData {
  type: "primary" | "secondary" | "root";
  isSelected: boolean;
  label?: string;
}

export interface Node {
  id: string;
  type: "customNode";
  data: NodeData;
  description?: string;
  position: { x: number; y: number };
  progress?: { status?: string };
}

export interface Edge {
  type: string;
  data: Record<string, unknown>;
  position: { x: number; y: number };
}
