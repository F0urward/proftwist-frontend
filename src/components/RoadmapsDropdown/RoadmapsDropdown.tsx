import { useState } from "react";
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { Map, Person } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

const RoadmapsDropdown = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        variant="text"
        onClick={handleOpen}
      >
        Roadmaps
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              bgcolor: "#212121",
              color: "#fff",
              borderRadius: 2,
              border: "1px solid #444",
              width: "300px",
            },
          },
          list: {
            sx: {
              py: 0.5,
            },
          },
        }}
      >
        <MenuItem
          component={RouterLink}
          to="/roadmaps"
          onClick={handleClose}
          sx={{
            "&:hover": { bgcolor: "#2B1631" },
          }}
        >
          <ListItemIcon>
            <Map fontSize="small" sx={{ color: "#BC57FF" }} />
          </ListItemIcon>
          <ListItemText primary="Официальные roadmaps" />
        </MenuItem>

        <MenuItem
          component={RouterLink}
          to="/personal"
          onClick={handleClose}
          sx={{
            "&:hover": { bgcolor: "#2B1631" },
          }}
        >
          <ListItemIcon>
            <Person fontSize="small" sx={{ color: "#BC57FF" }} />
          </ListItemIcon>
          <ListItemText primary="Мои roadmaps" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default RoadmapsDropdown;
