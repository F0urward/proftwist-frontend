import { useRef, useState, ChangeEvent } from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import { East } from "@mui/icons-material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import TextInput from "../TextInput/TextInput";
import { profileSchema, ProfileFormData } from "../../utils/entrySchemas";
import { Link as RouterLink } from "react-router-dom";
import GroupIcon from "@mui/icons-material/Group";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { useNotification } from "../Notification/Notification";
import { authService } from "../../api";
import { useEffect } from "react";
import { useAppSelector, RootState } from "../../store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkIfAuthenticated } from "../../store/slices/authSlice";
import { useAppDispatch } from "../../store";

const ProfileView = () => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [open, setOpen] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { showNotification, Notification } = useNotification();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      passwordRepeat: "",
    },
  });

  const watchedUsername = watch("username");
  const watchedEmail = watch("email");
  const isDirty =
    pendingAvatar !== null ||
    watchedUsername !== (user?.username ?? "") ||
    watchedEmail !== (user?.email ?? "");

  const openDialog = () => {
    setOpen(true);
  };

  const clearAvatarPreview = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setPendingAvatar(null);
    clearAvatarPreview();
  };

  const handlePickAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setPendingAvatar(e.target.files[0]);
    clearAvatarPreview();
    setAvatarPreview(URL.createObjectURL(e.target.files[0]));
    e.target.value = "";
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (pendingAvatar) {
        await authService.uploadAvatar(pendingAvatar);
      }
      await authService.update({
        username: data.username,
        email: data.email,
      });
      dispatch(checkIfAuthenticated());
      showNotification("Профиль успешно обновлён", "success");
      setPendingAvatar(null);
      clearAvatarPreview();
      setOpen(false);
    } catch (err) {
      console.error(err);
      showNotification("Не удалось сохранить изменения", "error");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (user) return;
    async function getMe() {
      try {
        const me = await authService.getMe();
        reset({
          username: me.username || "",
          email: me.email || "",
          password: "",
          passwordRepeat: "",
        });
      } catch {
        showNotification("Не удалось загрузить профиль", "error");
      } finally {
      }
    }
    getMe();
  }, [user, reset, showNotification]);

  useEffect(() => {
    if (!user) return;
    reset({
      username: user.username || "",
      email: user.email || "",
      password: "",
      passwordRepeat: "",
    });
  }, [user, reset]);

  return (
    <Paper
      variant="outlined"
      sx={{
        width: { xs: "90vw", md: "40vw" },
        minHeight: "80vh",
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2.5,
          pt: 1.25,
          pb: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Профиль
        </Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={openDialog}
        >
          Настройки
        </Button>
      </Box>
      <Divider
        sx={{
          ml: 2.5,
          mr: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      />

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Avatar
            alt={user ? user.username.charAt(0).toUpperCase() : ""}
            src={user?.image || "/static/images/avatar/1.jpg"}
            sx={{
              width: 96,
              height: 96,
              fontSize: 48,
            }}
          ></Avatar>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonIcon fontSize="small" />
              <Typography>{user?.username}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <EmailIcon fontSize="small" />
              <Typography>{user?.email}</Typography>
            </Stack>
          </Stack>
        </Grid>
      </Box>

      <Divider
        sx={{
          mx: 2.5,
          mb: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      />

      <Box sx={{ px: 3, pb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Моя активность
        </Typography>

        <Stack direction="column" spacing={2} sx={{ mt: 2 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            component={RouterLink}
            to="/friends"
            sx={{
              textDecoration: "none",
              color: "text.primary",
              cursor: "pointer",
              "&:hover": {
                color: "primary.main",
              },
              "&:hover .arrow": {
                color: "primary.main",
              },
            }}
          >
            <GroupIcon sx={{ fontSize: 18 }} />
            <Typography>Друзья</Typography>
            <East
              className="arrow"
              sx={{
                fontSize: 18,
              }}
            />
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            component={RouterLink}
            to="/personal"
            sx={{
              textDecoration: "none",
              color: "text.primary",
              cursor: "pointer",
              "&:hover": {
                color: "primary.main",
              },
              "&:hover .arrow": {
                color: "primary.main",
              },
            }}
          >
            <GroupIcon sx={{ fontSize: 18 }} />
            <Typography>Мои дорожные карты</Typography>
            <East
              className="arrow"
              sx={{
                fontSize: 18,
              }}
            />
          </Stack>
        </Stack>
      </Box>

      <Dialog
        open={open}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Настройки профиля</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ p: 3, pb: 0 }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  alt={user ? user.username.charAt(0).toUpperCase() : ""}
                  src={avatarPreview || user?.image}
                  sx={{
                    width: 72,
                    height: 72,
                    fontSize: 24,
                  }}
                ></Avatar>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png, image/jpg, image/jpeg"
                  hidden
                  onChange={handlePickAvatar}
                />
                <Button
                  variant="text"
                  startIcon={<PhotoCamera />}
                  onClick={() => fileRef.current?.click()}
                >
                  Загрузить аватар
                </Button>
              </Stack>

              <TextInput
                label="Имя пользователя"
                placeholder="Введите имя пользователя"
                {...register("username")}
                error={!!errors.username}
                helperText={errors.username?.message}
              />

              <TextInput
                label="Электронная почта"
                type="email"
                placeholder="Введите почту"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              {/*
              <Divider sx={{ borderColor: "rgba(255,255,255,.08)" }} />

              <TextInput
                label="Новый пароль"
                type="password"
                placeholder="Введите пароль"
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
              />

              <TextInput
                label="Повторите пароль"
                type="password"
                placeholder="Повторите пароль"
                {...register("passwordRepeat")}
                error={!!errors.passwordRepeat}
                helperText={errors.passwordRepeat?.message}
              />
              */}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button variant="text" onClick={handleCloseDialog} disabled={isSaving}>
              Отмена
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={!isDirty || isSaving}
            >
              Сохранить
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      {Notification}
    </Paper>
  );
};

export default ProfileView;
