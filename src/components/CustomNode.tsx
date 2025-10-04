import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, InputBase, Typography } from "@mui/material";
import { Handle, Position, useEdges } from "@xyflow/react";
import { AppDispatch } from "../store";
import { useDispatch } from "react-redux";
import { editorSliceActions } from "../store/slices/editorSlice";

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
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch<AppDispatch>();

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

  const handleDoubleClick = () => {
    if (isEditing) return;

    setIsEditing(true);
    inputRef.current?.focus();
  };

  const handleInputBlur = () => {
    setIsEditing(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      editorSliceActions.updateNode({
        id,
        data: {
          label: event.target.value,
        },
      })
    );
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef.current]);

  return (
    <div className="text-updater-node" onDoubleClick={handleDoubleClick}>
      <Box
        sx={{
          borderRadius: "3px",
          minWidth: "140px",
          minHeight: type === "root" ? "70px" : "30px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: background,
          border: isSelected ? "1px solid #FFF" : "none",
          boxSizing: "border-box",
        }}
      >
        {isEditing ? (
          <InputBase
            ref={inputRef}
            multiline
            value={label}
            onBlur={handleInputBlur}
            onChange={handleInputChange}
          />
        ) : (
          <Typography>{label}</Typography>
        )}
      </Box>
      {type !== "root" && <Handle type="target" position={Position.Top} />}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
