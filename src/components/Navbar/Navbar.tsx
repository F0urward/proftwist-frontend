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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { IconButton } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MapIcon from "@mui/icons-material/Map";
import ChatIcon from "@mui/icons-material/Chat";
import { Person } from "@mui/icons-material";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";
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
  const [mobileAnchorEl, setMobileAnchorEl] = useState<null | HTMLElement>(
    null,
  );

  const handleMobileMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    setMobileAnchorEl(e.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleLogoutInitiate = () => {
    setIsLogoutConfirmOpen(true);
    setAnchorEl(null);
  };

  const handleLogoutConfirm = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate("/");
    } finally {
      setIsLogoutConfirmOpen(false);
    }
  };

  const handleLogoutCancel = () => {
    setIsLogoutConfirmOpen(false);
  };

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
        handleLogoutInitiate();
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
            alt="Логотип ProfTwist"
            sx={{ width: 32, height: 32, borderRadius: "8px" }}
          />
          <Typography
            variant="h6"
            sx={{
              display: { xs: "none", sm: "block" },
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

        {isLoggedIn ? (
          <>
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                flex: 1,
                justifyContent: "center",
                gap: 2,
              }}
            >
              <RoadmapsDropdown />

              <Button variant="text" component={NavLink} to="/chats">
                Чаты
              </Button>

              <Button variant="text" component={NavLink} to="/friends">
                Друзья
              </Button>

              <Button variant="text" onClick={() => setIsCreateModalOpen(true)}>
                Создать роадмап
              </Button>
            </Box>

            <Box
              sx={{
                display: { xs: "flex", sm: "none" },
                paddingLeft: 1,
                alignItems: "left",
                width: "100%",
              }}
            >
              <IconButton
                onClick={handleMobileMenuOpen}
                aria-label="open navigation menu"
                sx={{ color: "#BC57FF" }}
              >
                <MenuRoundedIcon sx={{ fontSize: 32 }} />
              </IconButton>

              <Menu
                anchorEl={mobileAnchorEl}
                open={Boolean(mobileAnchorEl)}
                onClose={handleMobileMenuClose}
                keepMounted
              >
                <MenuItem
                  onClick={() => {
                    navigate("/roadmaps");
                    handleMobileMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <MapIcon fontSize="small" sx={{ color: "#BC57FF" }} />
                  </ListItemIcon>
                  <ListItemText primary="Роадмапы" />
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    navigate("/personal");
                    handleMobileMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <Person fontSize="small" sx={{ color: "#BC57FF" }} />
                  </ListItemIcon>
                  <ListItemText primary="Мои роадмапы" />
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    navigate("/chats");
                    handleMobileMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <ChatIcon fontSize="small" sx={{ color: "#BC57FF" }} />
                  </ListItemIcon>
                  <ListItemText primary="Чаты" />
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    navigate("/friends");
                    handleMobileMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <PeopleIcon fontSize="small" sx={{ color: "#BC57FF" }} />
                  </ListItemIcon>
                  <ListItemText primary="Друзья" />
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setIsCreateModalOpen(true);
                    handleMobileMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <AddIcon fontSize="small" sx={{ color: "#BC57FF" }} />
                  </ListItemIcon>
                  <ListItemText primary="Создать роадмап" />
                </MenuItem>
              </Menu>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              flex: 1,
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Button variant="text" component={NavLink} to="/roadmaps">
              Роадмапы
            </Button>
          </Box>
        )}

        {isLoggedIn ? (
          <>
            <Avatar
              alt={
                userData
                  ? userData.username.charAt(0).toUpperCase()
                  : "Аватар пользователя"
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
            <Dialog open={isLogoutConfirmOpen} onClose={handleLogoutCancel}>
              <DialogTitle>Подтвердите выход</DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ color: "white" }}>
                  Вы уверены, что хотите выйти из аккаунта?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleLogoutCancel}>Отмена</Button>
                <Button
                  onClick={handleLogoutConfirm}
                  variant="contained"
                  color="primary"
                >
                  Выйти
                </Button>
              </DialogActions>
            </Dialog>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              gap: 3,
            }}
          >
            <Button variant="contained" component={RouterLink} to="/login">
              Войти
            </Button>

            <Button
              variant="text"
              component={RouterLink}
              to="/signup"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
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
