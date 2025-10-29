import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Paper, Typography, Stack, Button, Link, Alert } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import TitlePaper from "../components/TitlePaper/TitlePaper";
import BaseLayout from "../components/BaseLayout/BaseLayout";
import TextInput from "../components/TextInput/TextInput";
import { RootState, useAppDispatch, useAppSelector } from "../store";
import { login } from "../store/slices/authSlice";
import axios from "axios";

const loginSchema = z.object({
  email: z
    .email({ message: "Invalid email address" })
    .nonempty("Email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .nonempty("Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const navigate = useNavigate();

  const error = useAppSelector((state: RootState) => state.auth.error);
  const loading = useAppSelector((state: RootState) => state.auth.isLoading);

  const dispatch = useAppDispatch();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(login(data));

      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleVKIDAuthClick = async () => {
    try {
      const response = await axios.get("/api/auth/vk/link");
      const url = response.data["vk_oauth_url"];
      window.open(url, "_self");
    } catch (error) {
      console.error("error", error);
    }
  };

  return (
    <BaseLayout>
      <TitlePaper
        title="Войдите в аккаунт"
        subtitle="Продолжите освоение профессии вместе с нами"
      ></TitlePaper>
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
        }}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextInput
            label="Email"
            type="email"
            placeholder="example@email.com"
            autoComplete="email"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextInput
            label="Пароль"
            type="password"
            placeholder="Введите ваш пароль"
            autoComplete="current-password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 1 }}
            disabled={loading}
          >
            Войти в аккаунт
          </Button>
          <Button
            className=""
            onClick={handleVKIDAuthClick}
            sx={{
              background: "#0077FF",
              "&:hover": { background: "#0564d1ff" },
            }}
          >
            Войти через VK
          </Button>
          <Typography variant="body1" sx={{ textAlign: "center" }}>
            Еще нет аккаунта?{" "}
            <Link
              component={RouterLink}
              to="/signup"
              underline="hover"
              sx={{ fontWeight: 600 }}
            >
              Зарегистрирутесь
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </BaseLayout>
  );
};

export default LoginPage;
