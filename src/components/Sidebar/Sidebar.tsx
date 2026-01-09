import { Stack, Button } from "@mui/material";

import Crop75Icon from "@mui/icons-material/Crop75";
import TitleIcon from "@mui/icons-material/Title";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import SaveIcon from "@mui/icons-material/Save";
import { RootState, useAppDispatch, useAppSelector } from "../../store";
import { useRef, useState } from "react";
import { editorSliceActions } from "../../store/slices/editorSlice";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { roadmapService } from "../../api/roadmap.service";
import { useNavigate } from "react-router-dom";
import { roadmapinfoService } from "../../api/roadmapinfo.service";

import { useNotification } from "../Notification/Notification";

type SidebarVariant = "desktop" | "sheet";

interface SidebarProps {
  addNode: (nodeType: "root" | "primary" | "secondary" | "text") => void;
  variant?: SidebarVariant;
}

interface Actions {
  Icon: typeof Crop75Icon;
  title: string;
  handleClick: () => void;
}

export const Sidebar = ({ addNode, variant = "desktop" }: SidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const { roadmap_id } = useParams();
  const navigate = useNavigate();

  const nodes = useAppSelector((state: RootState) => state.editor.nodes);
  const edges = useAppSelector((state: RootState) => state.editor.edges);
  const [roadmapInfoId, setRoadmapInfoId] = useState<string | null>(null);

  const { showNotification, Notification } = useNotification();

  const isSheet = variant === "sheet";

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
      const { nodes, edges } = JSON.parse(fileContent);
      dispatch(editorSliceActions.setNodes(nodes));
      dispatch(editorSliceActions.setEdges(edges));
    };

    reader.onerror = () => {
      showNotification("Ошибка при чтении файла", "error");
    };

    reader.readAsText(file);
  };

  const handleSave = async () => {
    if (!roadmap_id) {
      showNotification("Невозможно сохранить: roadmap_id не найден", "error");
      return;
    }

    try {
      await roadmapService.updateGraph(roadmap_id, { nodes, edges });
      showNotification("Роадмап успешно сохранён!", "success");
    } catch (e) {
      console.error("Ошибка при сохранении:", e);
      showNotification("Ошибка при сохранении роадмапа", "error");
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
        const data = JSON.stringify({ nodes, edges });

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
      Icon: SaveIcon,
      title: "Сохранить",
      handleClick: handleSave,
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
        {actions.map(({ Icon, title, handleClick }) => (
          <Button
            key={title}
            startIcon={<Icon />}
            variant="contained"
            onClick={handleClick}
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
      {Notification}
    </>
  );
};
