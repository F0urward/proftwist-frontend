import { useMemo } from "react";
import { Box, IconButton, Stack, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { Node } from "@xyflow/react";

type NodeEditorSidebarProps = {
  open: boolean;
  node: Node | null;
  onClose: () => void;
  onLabelChange: (value: string) => void;
};

export const NodeEditorSidebar = ({
  open,
  node,
  onClose,
  onLabelChange,
}: NodeEditorSidebarProps) => {
  const label = useMemo(() => (node?.data as any)?.label ?? "", [node]);
  const nodeType = useMemo(() => (node?.data as any)?.type ?? "Node", [node]);

  if (!open || !node) {
    return null;
  }

  return (
    <Box
      component="aside"
      sx={{
        width: { xs: "100%", sm: 360 },
        height: "100%",
        bgcolor: "#181818",
        color: "#fff",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 0 20px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 3, flex: 1, boxSizing: "border-box" }}>
        <Stack spacing={3} sx={{ height: "100%" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography
                variant="overline"
                sx={{ color: "rgba(255,255,255,0.54)" }}
              >
                {nodeType}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Настройки узла
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ color: "rgba(255,255,255,0.72)" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <TextField
            label="Название"
            value={label}
            onChange={(event) => onLabelChange(event.target.value)}
            multiline
            minRows={3}
            variant="filled"
            fullWidth
            slotProps={{
              input: {
                sx: {
                  bgcolor: "rgba(255,255,255,0.06)",
                  borderRadius: 2,
                  color: "#fff",
                },
              },
              inputLabel: {
                sx: {
                  color: "rgba(255,255,255,0.6)",
                  "&.Mui-focused": { color: "#fff" },
                },
              },
            }}
          />
        </Stack>
      </Box>
    </Box>
  );
};
