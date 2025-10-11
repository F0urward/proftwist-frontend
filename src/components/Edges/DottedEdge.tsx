import { BaseEdge, EdgeLabelRenderer, getStraightPath } from "@xyflow/react";

export const DottedEdge = ({ id, sourceX, sourceY, targetX, targetY }) => {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          top: 0,
          stroke: "#fff",
          strokeDasharray: "5 5",
        }}
      />
    </>
  );
};
