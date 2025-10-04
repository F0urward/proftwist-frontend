import { Stack, Button } from "@mui/material";
import Crop75Icon from "@mui/icons-material/Crop75";

interface SidebarProps {
  addNode: (nodeType: "primary" | "secondary") => void;
}

export const Sidebar = ({ addNode }: SidebarProps) => {
  return (
    <Stack
      gap="10px"
      sx={{ width: "300px", padding: "10px", background: "#000" }}
    >
      <Button
        startIcon={<Crop75Icon />}
        variant="contained"
        onClick={() => addNode("primary")}
      >
        Topic
      </Button>

      <Button
        startIcon={<Crop75Icon />}
        variant="contained"
        onClick={() => addNode("secondary")}
      >
        Sub Topic
      </Button>
    </Stack>
  );
};
