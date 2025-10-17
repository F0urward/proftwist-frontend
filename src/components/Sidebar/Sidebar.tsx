import { Stack, Button } from "@mui/material";

import Crop75Icon from "@mui/icons-material/Crop75";
import TitleIcon from "@mui/icons-material/Title";
import DownloadIcon from "@mui/icons-material/Download";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { RootState, useAppDispatch, useAppSelector } from "../../store";
import { useRef } from "react";
import { editorSliceActions } from "../../store/slices/editorSlice";

interface SidebarProps {
  addNode: (nodeType: "root" | "primary" | "secondary" | "text") => void;
}

interface Actions {
  Icon: typeof Crop75Icon;
  title: string;
  handleClick: (event: MouseEvent) => void;
}

export const Sidebar = ({ addNode }: SidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();

  const nodes = useAppSelector((state: RootState) => state.editor.nodes);
  const edges = useAppSelector((state: RootState) => state.editor.edges);

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
      // todo: write universal alert for all app's errors and use it here
      alert("Error reading file");
    };

    reader.readAsText(file);
  };

  const actions: Actions[] = [
    {
      Icon: Crop75Icon,
      title: "Root Node",
      handleClick: () => addNode("root"),
    },
    {
      Icon: Crop75Icon,
      title: "Topic",
      handleClick: () => addNode("primary"),
    },
    {
      Icon: Crop75Icon,
      title: "Sub Topic",
      handleClick: () => addNode("secondary"),
    },
    {
      Icon: TitleIcon,
      title: "Text",
      handleClick: () => addNode("text"),
    },

    {
      Icon: FileUploadIcon,
      title: "Import",
      handleClick: async () => {
        if (!fileInputRef.current) return;

        fileInputRef.current.value = "";
        fileInputRef.current.click();
      },
    },
    {
      Icon: DownloadIcon,
      title: "Export",
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
  ];

  return (
    <Stack
      gap="10px"
      sx={{ width: "300px", padding: "10px", background: "#000", height: "100%" }}
    >
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
  );
};
