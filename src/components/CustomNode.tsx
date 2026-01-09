import { useMemo, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { Handle, Position } from "@xyflow/react";
import { editorSliceActions } from "../store/slices/editorSlice";
import { useAppDispatch } from "../store";

type NodeType = "primary" | "secondary" | "root";

interface NodeProps {
  id: string;
  data: {
    label: string;
    type: NodeType;
  };
  selected: boolean;
}

export const CustomNode = ({
  id,
  data: { label, type },
  selected,
}: NodeProps) => {
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

  return (
    <div className="text-updater-node">
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
          outline: selected
            ? "1px solid rgba(255,255,255,0.95)"
            : "1px solid transparent",
          outlineOffset: 0,
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
