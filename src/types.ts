export interface NodeData {
  type: "primary" | "secondary" | "root";
  isSelected: boolean;
  [key: string]: any;
}

export interface Node {
  id: string;
  type: "customNode";
  data: NodeData;
  description?: string;
  position: { x: number; y: number };
}

export interface Edge {
  id: string;
  type: string;
  data: Record<string, unknown>;
  position: { x: number; y: number };
}
