import { DashedEdge, SolidEdge } from "./components/Edges";
import { CustomNode } from "./components/CustomNode";
import { TextNode } from "./components/TextNode";

export const edgeTypes = {
  solid: SolidEdge,
  dashed: DashedEdge,
};

export const nodeTypes = {
  custom: CustomNode,
  text: TextNode,
};
