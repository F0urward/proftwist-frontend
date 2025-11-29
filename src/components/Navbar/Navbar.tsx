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
  ListItemText,
} from "@mui/material";
import { Link as RouterLink, NavLink, useNavigate } from "react-router-dom";
import RoadmapsDropdown from "../RoadmapsDropdown/RoadmapsDropdown";
import { RootState, useAppDispatch, useAppSelector } from "../../store";
import { useEffect, useState } from "react";
import { checkIfAuthenticated, logout } from "../../store/slices/authSlice";
import { AccountCircle, Logout } from "@mui/icons-material";
import CreateRoadmapInfoModal from "../CreateRoadmapsinfoModal/CreateRoadmapsinfoModal";
import type { User } from "../../types/auth";

interface MenuEntry {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const isDefaultAvatar = (url?: string) => {
  if (!url) return false;
  const normalized = url.trim().replace(/^\/+/, "");
  return (
    normalized === "avatars/default.jpg" ||
    normalized.endsWith("/avatars/default.jpg")
  );
};

const resolveAvatarUrl = (user?: User | null): string | undefined => {
  if (!user) return undefined;
  const candidates = [
    user.image,
    (user as User & { avatar_url?: string }).avatar_url,
    (user as User & { avatar?: string }).avatar,
  ];
  for (const candidate of candidates) {
    if (
      typeof candidate === "string" &&
      candidate.trim().length > 0 &&
      !isDefaultAvatar(candidate)
    ) {
      return candidate;
    }
  }
  return undefined;
};

const Navbar = () => {
  const isLoggedIn = useAppSelector(
    (state: RootState) => state.auth.isLoggedIn,
  );
  const userData = useAppSelector((state: RootState) => state.auth.user);
  const avatarUrl = resolveAvatarUrl(userData);
  const avatarInitial =
    userData?.username?.trim()?.charAt(0).toUpperCase() ?? "";

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const menuOptions: MenuEntry[] = [
    {
      title: "Профиль",
      icon: <AccountCircle fontSize="small" sx={{ color: "#BC57FF" }} />,
      onClick() {
        navigate("/profile");
        setAnchorEl(null);
      },
    },
    {
      title: "Выйти",
      icon: <Logout fontSize="small" sx={{ color: "#BC57FF" }} />,
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
        <Box
          component={RouterLink}
          to="/roadmaps"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
          }}
        >
          <Box
            component="img"
            src="/images/logo.webp"
            alt="ProfTwist logo"
            sx={{ width: 32, height: 32, borderRadius: "8px" }}
          />
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"TDAText"',
              fontWeight: 700,
              backgroundImage:
                "linear-gradient(90deg, #BC57FF 0%, #FF4DCA 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
            }}
          >
            ProfTwist
          </Typography>
        </Box>

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
              Роадмапы
            </Button>
          )}

          {isLoggedIn && (
            <Button variant="text" component={NavLink} to="/chats">
              Чаты
            </Button>
          )}
          {isLoggedIn && (
            <Button variant="text" component={NavLink} to="/friends">
              Друзья
            </Button>
          )}
          {isLoggedIn && (
            <Button variant="text" onClick={() => setIsCreateModalOpen(true)}>
              Создать роадмап
            </Button>
          )}
        </Box>

        {isLoggedIn ? (
          <>
            <Avatar
              alt={
                userData
                  ? userData.username.charAt(0).toUpperCase()
                  : "User avatar"
              }
              src={avatarUrl}
              onClick={handleAvatarClick}
              sx={{ cursor: "pointer" }}
            >
              {!avatarUrl && avatarInitial}
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>
                <ListItemText
                  primary={userData?.username}
                  sx={{ color: "white" }}
                />
              </MenuItem>
              {menuOptions.map(({ title, icon, onClick }) => (
                <MenuItem key={title} onClick={onClick}>
                  <ListItemIcon>{icon}</ListItemIcon>
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
        {isLoggedIn && (
          <CreateRoadmapInfoModal
            open={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
