import { useMemo, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { Handle, Position } from "@xyflow/react";
import { editorSliceActions } from "../store/slices/editorSlice";
import { useAppDispatch } from "../store";

type NodeType = "primary" | "secondary" | "root";

interface NodeProps {
  id: string;
  data: {
    isSelected: boolean;
    label: string;
    type: NodeType;
  };
}

export const CustomNode = ({
  id,
  data: { label, type, isSelected },
}: NodeProps) => {
  const dispatch = useAppDispatch();

  const background = useMemo(() => {
    switch (type) {
      case "primary":
        return "#FF89DC";
      case "secondary":
        return "#D596FF";
      case "root":
        return "linear-gradient(90deg, #D596FF 0%, #FF89DC 100%)";
    }
  }, [type]);

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      dispatch(editorSliceActions.markElementAsSelected(id));
      dispatch(editorSliceActions.openNodeEditor(id));
    },
    [dispatch, id],
  );

  return (
    <div className="text-updater-node" onDoubleClick={handleDoubleClick}>
      <Box
        sx={{
          borderRadius: "10px",
          padding: "10px",
          minWidth: "140px",
          minHeight: type === "root" ? "70px" : "30px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: background,
          border: isSelected ? "1px solid #FFF" : "none",
          boxSizing: "border-box",
          cursor: "pointer",
          transition: "all 0.25s ease",
          transformOrigin: "center",

          "&:hover": {
            transform: "scale(1.06)",
            boxShadow: "0 0 18px rgba(188, 87, 255, 0.65)",
            zIndex: 10,
          },
        }}
      >
        <Typography>{label}</Typography>
      </Box>
      {type !== "root" && <Handle type="target" position={Position.Top} />}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
