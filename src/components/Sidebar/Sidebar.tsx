import { Stack, Button } from "@mui/material";

import Crop75Icon from "@mui/icons-material/Crop75";
import TitleIcon from "@mui/icons-material/Title";

interface SidebarProps {
  addNode: (nodeType: "primary" | "secondary" | "text") => void;
}

interface Actions {
  Icon: typeof Crop75Icon;
  title: string;
  handleClick: (event: MouseEvent) => void;
}

export const Sidebar = ({ addNode }: SidebarProps) => {
  const actions: Actions[] = [
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
  ];

  return (
    <Stack
      gap="10px"
      sx={{ width: "300px", padding: "10px", background: "#000" }}
    >
      {actions.map(({ Icon, title, handleClick }) => (
        <Button startIcon={<Icon />} variant="contained" onClick={handleClick}>
          {title}
        </Button>
      ))}
    </Stack>
  );
};
