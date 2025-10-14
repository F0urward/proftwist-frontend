import { Stack, Button } from "@mui/material";

import Crop75Icon from "@mui/icons-material/Crop75";
import TitleIcon from "@mui/icons-material/Title";
import DownloadIcon from "@mui/icons-material/Download";
import { RootState, useAppSelector } from "../../store";

interface SidebarProps {
  addNode: (nodeType: "root" | "primary" | "secondary" | "text") => void;
}

interface Actions {
  Icon: typeof Crop75Icon;
  title: string;
  handleClick: (event: MouseEvent) => void;
}

export const Sidebar = ({ addNode }: SidebarProps) => {
  const nodes = useAppSelector((state: RootState) => state.editor.nodes);
  const edges = useAppSelector((state: RootState) => state.editor.edges);

  const downloadData = () => {
    const data = JSON.stringify({ nodes, edges });
    localStorage.setItem("flow", data);
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
      Icon: DownloadIcon,
      title: "Save",
      handleClick: downloadData,
    },
  ];

  return (
    <Stack
      gap="10px"
      sx={{ width: "300px", padding: "10px", background: "#000" }}
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
    </Stack>
  );
};
