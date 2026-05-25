import { useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Stack,
  TextField,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { Node } from "@xyflow/react";
import { aiService } from "../../api";

type NodeType = "primary" | "secondary" | "root";

type NodeEditorSidebarProps = {
  open: boolean;
  node: Node | null;
  roadmapId?: string;
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
  roadmapId,
  onClose,
  onLabelChange,
  onDescriptionChange,
  onDelete,
}: NodeEditorSidebarProps) => {
  const theme = useTheme();
  const [isGeneratingDescription, setIsGeneratingDescription] =
    useState(false);
  const label = useMemo(() => (node?.data as any)?.label ?? "", [node]);
  const description = useMemo(() => (node as any)?.description ?? "", [node]);
  const nodeType = useMemo(
    () => (node?.data as any)?.type as NodeType | undefined,
    [node],
  );
  const nodeTypeRu = useMemo(() => {
    const rawType = nodeType;
    if (!rawType) return "Нода";
    return NODE_TYPE_RU[rawType] ?? "Нода";
  }, [nodeType]);

  const handleGenerateDescription = async () => {
    if (!node || isGeneratingDescription) return;

    setIsGeneratingDescription(true);

    try {
      const generatedDescription =
        await aiService.generateRoadmapNodeDescription({
          roadmap_id: roadmapId,
          node_id: node.id,
          node_label: label,
          node_type: nodeType,
          current_description: description,
        });

      onDescriptionChange(generatedDescription);
    } catch (error) {
      console.error("Failed to generate node description:", error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  if (!open || !node) {
    return null;
  }

  return (
    <Box
      component="aside"
      sx={{
        width: { xs: "100%", sm: 360 },
        height: "100%",
        bgcolor: "background.default",
        color: "text.primary",
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
                sx={{ color: "text.secondary" }}
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
              sx={{ color: "text.secondary" }}
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
                  bgcolor: `rgba(${theme.palette.mode === "dark" ? "255,255,255" : "0,0,0"}, 0.06)`,
                  borderRadius: 2,
                  color: "text.primary",
                },
              },
              inputLabel: {
                sx: {
                  color: "text.secondary",
                  "&.Mui-focused": { color: "text.primary" },
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
                  bgcolor: `rgba(${theme.palette.mode === "dark" ? "255,255,255" : "0,0,0"}, 0.06)`,
                  borderRadius: 2,
                  color: "text.primary",
                },
              },
              inputLabel: {
                sx: {
                  color: "text.secondary",
                  "&.Mui-focused": { color: "text.primary" },
                },
              },
            }}
          />

          <Button
            variant="contained"
            startIcon={
              isGeneratingDescription ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <AutoAwesomeIcon />
              )
            }
            onClick={handleGenerateDescription}
            disabled={isGeneratingDescription || !label.trim()}
            sx={(theme) => ({
              textTransform: "none",
              color: "#fff",
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              "&:hover": {
                background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.main})`,
              },
              "&.Mui-disabled": {
                color: theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.42)"
                  : "rgba(44,24,16,0.38)",
                background: theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              },
            })}
          >
            {isGeneratingDescription
              ? "Генерация..."
              : "Сгенерировать описание"}
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={onDelete}
            sx={{
              mt: 1,
              borderColor: theme.palette.divider,
              color: "text.primary",
              "&:hover": {
                borderColor: theme.palette.text.secondary,
              },
            }}
          >
            Удалить узел
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};
