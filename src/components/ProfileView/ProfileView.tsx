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
import { alpha } from "@mui/material/styles";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import TextInput from "../TextInput/TextInput";
import { profileSchema, ProfileFormData } from "../../utils/entrySchemas";
import { User } from "../../types/auth";
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

  const openDialog = () => {
    setOpen(true);
  };

  const handlePickAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    try {
      await authService.uploadAvatar(file);
      showNotification("Аватар успешно обновлён", "success");
    } catch {
      showNotification("Ошибка загрузки аватара", "error");
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const result = await authService.update({
        username: data.username,
        email: data.email,
      });
      const me = await authService.getMe();

      dispatch(checkIfAuthenticated());
      console.log(result);
      showNotification("Профиль успешно обновлён", "success");
      setOpen(false);
    } catch (err) {
      console.error(err);
      showNotification("Не удалось сохранить изменения", "error");
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
  }, [user]);

  return (
    <Paper
      variant="outlined"
      sx={{
        width: "40vw",
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
      <Divider sx={{ ml: 2.5, mr: 2.5, borderBottom: "1px solid #848484" }} />

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Avatar
            src={user?.image || "/static/images/avatar/1.jpg"}
            sx={{
              width: 96,
              height: 96,
              bgcolor: alpha("#BC57FF", 0.15),
              border: "1px solid rgba(255,255,255,.12)",
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

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Настройки профиля</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ p: 3, pb: 0 }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={user?.image}
                  sx={{
                    width: 72,
                    height: 72,
                    fontSize: 24,
                    bgcolor: alpha("#BC57FF", 0.15),
                    border: "1px solid rgba(255,255,255,.12)",
                  }}
                ></Avatar>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
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
                label="Никнейм"
                placeholder="Введите никнейм"
                {...register("username")}
                error={!!errors.username}
                helperText={errors.username?.message}
              />

              <TextInput
                label="Email"
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
            <Button variant="text" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button variant="contained" type="submit">
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
