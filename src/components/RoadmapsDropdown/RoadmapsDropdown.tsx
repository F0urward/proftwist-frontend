import { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Map, Person } from "@mui/icons-material";
import { NavLink, useLocation } from "react-router-dom";

const RoadmapsDropdown = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { pathname } = useLocation();
  const inRoadmapsSection =
    pathname.startsWith("/roadmaps") || pathname.startsWith("/personal");

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        variant={inRoadmapsSection ? "contained" : "text"}
        onClick={handleOpen}
      >
        Роадмапы
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          component={NavLink}
          to="/roadmaps"
          onClick={handleClose}
          sx={{
            "&:hover": { bgcolor: "#2B1631" },
          }}
        >
          <ListItemIcon>
            <Map fontSize="small" sx={{ color: "#BC57FF" }} />
          </ListItemIcon>
          <ListItemText primary="Официальные роадмапы" />
        </MenuItem>

        <MenuItem component={NavLink} to="/personal" onClick={handleClose}>
          <ListItemIcon>
            <Person fontSize="small" sx={{ color: "#BC57FF" }} />
          </ListItemIcon>
          <ListItemText primary="Мои роадмапы" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default RoadmapsDropdown;
