import {
  Avatar,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import { Link as RouterLink, NavLink, useNavigate } from "react-router-dom";
import RoadmapsDropdown from "../RoadmapsDropdown/RoadmapsDropdown";
import { RootState, useAppDispatch, useAppSelector } from "../../store";
import { useEffect, useState } from "react";
import { checkIfAuthenticated, logout } from "../../store/slices/authSlice";
import { AccountCircle, Logout } from "@mui/icons-material";

interface MenuEntry {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const Navbar = () => {
  const isLoggedIn = useAppSelector(
    (state: RootState) => state.auth.isLoggedIn,
  );
  const userData = useAppSelector((state: RootState) => state.auth.user);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);

  const menuOptions: MenuEntry[] = [
    {
      title: "Профиль",
      icon: <AccountCircle fontSize="small" sx={{ color: "#BC57FF" }}/>,
      onClick() {
        navigate("/profile");
        setAnchorEl(null);
      },
    },
    {
      title: "Выйти",
      icon: <Logout fontSize="small" sx={{ color: "#BC57FF" }}/>,
      onClick() {
        dispatch(logout()).unwrap();
        navigate("/");
        setAnchorEl(null);
      },
    },
  ];

  const handleAvatarClick = (
    event: React.SyntheticEvent<MouseEvent, Event>,
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    dispatch(checkIfAuthenticated());
  }, []);

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: "background.paper",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: { xs: 3, md: 20 },
        }}
      >
        <Typography
          variant="h6"
          component={RouterLink}
          to="/roadmaps"
          sx={{
            fontFamily: '"TDAText"',
            textDecoration: "none",
            fontWeight: 700,
            backgroundImage: "linear-gradient(90deg, #BC57FF 0%, #FF4DCA 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
          }}
        >
          ProfTwist
        </Typography>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            gap: 3,
          }}
        >
          {isLoggedIn ? (
            <RoadmapsDropdown />
          ) : (
            <Button variant="text" component={NavLink} to="/roadmaps">
              Roadmaps
            </Button>
          )}
          <Button variant="text" component={NavLink} to="/materials">
            Материалы
          </Button>

        { isLoggedIn &&
          <Button variant="text" component={NavLink} to="/chats">
            Чаты
          </Button> 
        }
        { isLoggedIn &&
          <Button variant="text" component={NavLink} to="/">
            Создать роадмап
          </Button>
        }
        </Box>

        {isLoggedIn ? (
          <>
            <Avatar
              alt={userData ? userData.username.charAt(0).toUpperCase() : ""}
              src="/static/images/avatar/1.jpg"
              onClick={handleAvatarClick}
              sx={{ cursor: "pointer" }}
            />
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {menuOptions.map(({ title, icon, onClick }) => (
                <MenuItem key={title} onClick={onClick}>
                  <ListItemIcon>
                    {icon}
                  </ListItemIcon>
                  <ListItemText primary={title} />
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              gap: 3,
            }}
          >
            <Button variant="text" component={RouterLink} to="/login">
              Войти
            </Button>

            <Button variant="contained" component={RouterLink} to="/signup">
              Зарегистрироваться
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
