import { DottedEdge } from "./components/Edges";
import { CustomNode } from "./components/CustomNode";
import { TextNode } from "./components/TextNode";

export const edgeTypes = {
  dotted: DottedEdge,
};

export const nodeTypes = {
  custom: CustomNode,
  text: TextNode,
};
