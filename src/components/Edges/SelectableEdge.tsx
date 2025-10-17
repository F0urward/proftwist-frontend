import { useCallback, type CSSProperties } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

import { useAppDispatch } from "../../store";
import { editorSliceActions } from "../../store/slices/editorSlice";

type EdgeVariant = "solid" | "dashed";

interface SelectableEdgeProps extends EdgeProps {
  variant: EdgeVariant;
  dashPattern?: string;
}

const popupStyles: CSSProperties = {
  position: "absolute",
  transform: "translate(-50%, -50%)",
  pointerEvents: "all",
  backgroundColor: "#111",
  color: "#fff",
  borderRadius: "6px",
  padding: "6px 8px",
  display: "flex",
  gap: "6px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.35)",
  fontSize: "12px",
};

const buttonBaseStyles: CSSProperties = {
  border: "none",
  borderRadius: "4px",
  padding: "4px 6px",
  fontSize: "12px",
  cursor: "pointer",
  backgroundColor: "transparent",
  color: "inherit",
};

const SelectableEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected,
  markerEnd,
  markerStart,
  style,
  variant,
  dashPattern,
}: SelectableEdgeProps) => {
  const dispatch = useAppDispatch();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const handleVariantChange = useCallback(
    (nextVariant: EdgeVariant) => {
      if (nextVariant === variant) return;
      dispatch(
        editorSliceActions.updateEdgeType({
          id,
          type: nextVariant,
        })
      );
    },
    [dispatch, id, variant]
  );

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={{
          stroke: "#fff",
          strokeWidth: 2,
          strokeDasharray: dashPattern,
          ...style,
        }}
      />
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              ...popupStyles,
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              style={{
                ...buttonBaseStyles,
                backgroundColor:
                  variant === "solid" ? "rgba(255,255,255,0.2)" : "transparent",
              }}
              onClick={() => handleVariantChange("solid")}
            >
              Solid
            </button>
            <button
              style={{
                ...buttonBaseStyles,
                backgroundColor:
                  variant === "dashed" ? "rgba(255,255,255,0.2)" : "transparent",
              }}
              onClick={() => handleVariantChange("dashed")}
            >
              Dashed
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export const SolidEdge = (props: EdgeProps) => (
  <SelectableEdge {...props} variant="solid" />
);

export const DashedEdge = (props: EdgeProps) => (
  <SelectableEdge {...props} variant="dashed" dashPattern="6 6" />
);
