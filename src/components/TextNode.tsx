import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, InputBase, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { editorSliceActions } from "../store/slices/editorSlice";
import { useAppDispatch } from "../store";

interface NodeProps {
  id: string;
  data: {
    isSelected: boolean;
    label: string;
  };
}

export const TextNode = ({ id, data: { label, isSelected } }: NodeProps) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();

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
      }),
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: isSelected ? `1px solid ${theme.palette.text.primary}` : "none",
          boxSizing: "border-box",
          color: "text.primary",
          margin: 0,
          padding: 0,
        }}
      >
        {isEditing ? (
          <InputBase
            ref={inputRef}
            multiline
            value={label}
            onBlur={handleInputBlur}
            onChange={handleInputChange}
            sx={{ color: "text.primary", margin: 0, padding: 0 }}
          />
        ) : (
          <Typography component="div" sx={{ margin: 0, padding: 0 }}>
            <pre style={{ fontFamily: "inherit" }}>{label}</pre>
          </Typography>
        )}
      </Box>
    </div>
  );
};
