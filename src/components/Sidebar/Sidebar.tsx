import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";

import Crop75Icon from "@mui/icons-material/Crop75";
import TitleIcon from "@mui/icons-material/Title";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import SaveIcon from "@mui/icons-material/Save";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { RootState, useAppDispatch, useAppSelector } from "../../store";
import { useRef, useState } from "react";
import { editorSliceActions } from "../../store/slices/editorSlice";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { roadmapinfoService } from "../../api/roadmapinfo.service";
import { aiService } from "../../api/ai.service";
import { autoLayoutRoadmap } from "../../utils/autoLayoutRoadmap";
import { stripNodeFields, stripEdgeFields } from "../../utils/sanitizeGraph";

import { useNotification } from "../Notification/Notification";

type SidebarVariant = "desktop" | "sheet";

interface SidebarProps {
  addNode: (nodeType: "root" | "primary" | "secondary" | "text") => void;
  onAutoLayout: () => void;
  onSave: () => void | Promise<void>;
  variant?: SidebarVariant;
}

interface Actions {
  Icon: typeof Crop75Icon;
  title: string;
  handleClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const Sidebar = ({
  addNode,
  onAutoLayout,
  onSave,
  variant = "desktop",
}: SidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const { roadmap_id } = useParams();
  const navigate = useNavigate();

  const nodes = useAppSelector((state: RootState) => state.editor.nodes);
  const edges = useAppSelector((state: RootState) => state.editor.edges);
  const [roadmapInfoId, setRoadmapInfoId] = useState<string | null>(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiRoadmapPrompt, setAiRoadmapPrompt] = useState("");

  const { showNotification, Notification } = useNotification();

  const isSheet = variant === "sheet";
  const trimmedAiRoadmapPrompt = aiRoadmapPrompt.trim();

  useEffect(() => {
    if (!roadmap_id) return;
    roadmapinfoService
      .getByRoadmapId(roadmap_id)
      .then((data) => setRoadmapInfoId(data.id))
      .catch(() => setRoadmapInfoId(null));
  }, [roadmap_id]);

  const handleFileChange = () => {
    if (!fileInputRef.current) return;

    const file = fileInputRef.current.files?.[0] || null;

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const fileContent = event.target?.result as string;
      const { nodes: importedNodes, edges: importedEdges } =
        JSON.parse(fileContent);

      const hasPositions = importedNodes?.some((node: any) => node.position);
      let nodesWithPositions = importedNodes;
      if (!hasPositions) {
        nodesWithPositions = autoLayoutRoadmap(
          importedNodes || [],
          importedEdges || [],
        );
      }

      const cleanedNodes = stripNodeFields(nodesWithPositions || []);
      const cleanedEdges = stripEdgeFields(importedEdges || []);
      dispatch(editorSliceActions.setNodes(cleanedNodes));
      dispatch(editorSliceActions.setEdges(cleanedEdges));
    };

    reader.onerror = () => {
      showNotification("Ошибка при чтении файла", "error");
    };

    reader.readAsText(file);
  };

  const handleGenerateRoadmap = async () => {
    if (isGeneratingRoadmap || !trimmedAiRoadmapPrompt) return;

    setIsGeneratingRoadmap(true);

    try {
      const generatedRoadmap = await aiService.generateRoadmap({
        roadmap_id,
        prompt: trimmedAiRoadmapPrompt,
      });

      dispatch(editorSliceActions.setNodes(generatedRoadmap.nodes));
      dispatch(editorSliceActions.setEdges(generatedRoadmap.edges));
      setIsAiDialogOpen(false);
      setAiRoadmapPrompt("");
      showNotification("Roadmap успешно сгенерирован", "success");
    } catch (error) {
      console.error("Failed to generate roadmap:", error);
      showNotification("Ошибка при генерации roadmap", "error");
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const actions: Actions[] = [
    {
      Icon: Crop75Icon,
      title: "Корневая нода",
      handleClick: () => addNode("root"),
    },
    {
      Icon: Crop75Icon,
      title: "Тема",
      handleClick: () => addNode("primary"),
    },
    {
      Icon: Crop75Icon,
      title: "Подтема",
      handleClick: () => addNode("secondary"),
    },
    {
      Icon: TitleIcon,
      title: "Подпись",
      handleClick: () => addNode("text"),
    },
    {
      Icon: FileUploadIcon,
      title: "Импортировать",
      handleClick: async () => {
        if (!fileInputRef.current) return;

        fileInputRef.current.value = "";
        fileInputRef.current.click();
      },
    },
    {
      Icon: DownloadIcon,
      title: "Экспортировать",
      handleClick: () => {
        const cleanedNodes = stripNodeFields(nodes);
        const cleanedEdges = stripEdgeFields(edges);
        const data = JSON.stringify({
          nodes: cleanedNodes,
          edges: cleanedEdges,
        });

        const blob: Blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "scheme.json";

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
    },
    {
      Icon: AccountTreeIcon,
      title: "Авто-раскладка",
      handleClick: onAutoLayout,
      disabled: nodes.length === 0,
    },
    {
      Icon: SaveIcon,
      title: "Сохранить",
      handleClick: () => void onSave(),
    },
    {
      Icon: AutoAwesomeIcon,
      title: isGeneratingRoadmap
        ? "Генерация roadmap..."
        : "Создать roadmap с AI",
      handleClick: () => setIsAiDialogOpen(true),
      disabled: isGeneratingRoadmap,
      isLoading: isGeneratingRoadmap,
    },
  ];

  return (
    <>
      <Stack
        gap="10px"
        sx={{
          width: isSheet ? "100%" : "300px",
          padding: "10px",
          background: "transparent",
          height: "100%",
        }}
      >
        {roadmapInfoId && (
          <Button
            variant="text"
            startIcon={<ArrowBackIosNewIcon fontSize="small" />}
            sx={{
              textTransform: "none",
              justifyContent: "flex-start",
            }}
            onClick={() => {
              navigate(`/roadmaps/${roadmapInfoId}`);
            }}
          >
            К просмотру роадмапа
          </Button>
        )}
        {actions.map(({ Icon, title, handleClick, disabled, isLoading }) => (
          <Button
            key={title}
            startIcon={
              isLoading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <Icon />
              )
            }
            variant="contained"
            onClick={handleClick}
            disabled={Boolean(disabled)}
          >
            {title}
          </Button>
        ))}

        <input
          ref={fileInputRef}
          type="file"
          id="hidden-file-input"
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept="application/json,.json"
        />
      </Stack>

      <Dialog
        open={isAiDialogOpen}
        onClose={() => {
          if (!isGeneratingRoadmap) setIsAiDialogOpen(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Создать roadmap с AI</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            margin="dense"
            label="Каким должен быть roadmap?"
            placeholder="Например: roadmap для изучения React с нуля до продвинутого уровня"
            value={aiRoadmapPrompt}
            onChange={(event) => setAiRoadmapPrompt(event.target.value)}
            disabled={isGeneratingRoadmap}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsAiDialogOpen(false)}
            disabled={isGeneratingRoadmap}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            startIcon={
              isGeneratingRoadmap ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <AutoAwesomeIcon />
              )
            }
            onClick={() => void handleGenerateRoadmap()}
            disabled={isGeneratingRoadmap || !trimmedAiRoadmapPrompt}
          >
            {isGeneratingRoadmap ? "Генерация..." : "Сгенерировать"}
          </Button>
        </DialogActions>
      </Dialog>

      {Notification}
    </>
  );
};
