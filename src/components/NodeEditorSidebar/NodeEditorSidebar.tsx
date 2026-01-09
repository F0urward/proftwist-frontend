import { useMemo } from "react";
import {
  Box,
  IconButton,
  Stack,
  TextField,
  Typography,
  Button,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useTheme } from "@mui/material/styles";
import type { Node } from "@xyflow/react";

type NodeType = "primary" | "secondary" | "root";

type NodeEditorSidebarProps = {
  open: boolean;
  node: Node | null;
  onClose: () => void;
  onLabelChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDelete: () => void;
};

const NODE_TYPE_RU: Record<NodeType, string> = {
  root: "Корневая нода",
  primary: "Тема",
  secondary: "Подтема",
};

export const NodeEditorSidebar = ({
  open,
  node,
  onClose,
  onLabelChange,
  onDescriptionChange,
  onDelete,
}: NodeEditorSidebarProps) => {
  const label = useMemo(() => (node?.data as any)?.label ?? "", [node]);
  const description = useMemo(() => (node as any)?.description ?? "", [node]);
  const nodeTypeRu = useMemo(() => {
    const rawType = (node?.data as any)?.type as NodeType | undefined;
    if (!rawType) return "Нода";
    return NODE_TYPE_RU[rawType] ?? "Нода";
  }, [node]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
        zIndex: 21,
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
                {nodeTypeRu}
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

          <TextField
            label="Описание"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
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

          {isMobile && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={onDelete}
              sx={{
                mt: 1,
                borderColor: "rgba(255,255,255,0.24)",
                color: "#fff",
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.45)",
                },
              }}
            >
              Удалить узел
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
};
