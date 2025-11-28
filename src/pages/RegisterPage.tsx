import { Alert, Paper, Typography, Stack, Button, Link } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import TitlePaper from "../components/TitlePaper/TitlePaper";
import BaseLayout from "../components/BaseLayout/BaseLayout";
import TextInput from "../components/TextInput/TextInput";
import { registerSchema, SignupFormData } from "../utils/entrySchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RootState, useAppDispatch, useAppSelector } from "../store";
import { signup, login } from "../store/slices/authSlice";

const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(registerSchema),
  });

  const error = useAppSelector((state: RootState) => state.auth.error);
  const loading = useAppSelector((state: RootState) => state.auth.isLoading);

  const navigate = useNavigate();

  const onSubmit = async (data: SignupFormData) => {
    try {
      await dispatch(
        signup({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      ).unwrap();

      await dispatch(
        login({ email: data.email, password: data.password })
      ).unwrap();

      navigate("/");
    } catch (err: any) {
      console.error("Could not register", err);
    } finally {
    }
  };

  return (
    <BaseLayout>
      <TitlePaper
        title="Создайте аккаунт"
        subtitle="Начните свой карьерный путь вместе с нами"
      />
      <Paper
        sx={{ p: { xs: 3, md: 4 } }}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Stack spacing={3}>
          {error && 
            <Alert severity="error"
              sx={{
                borderRadius: "10px",
                background: "linear-gradient(90deg, #d23a95ff, #bc3b57ff)",
                color: "#fff",
                transition: "all 0.8s ease",
                "& .MuiAlert-icon": {
                  color: "#fff",
                },
                display: "flex",
                justifyContent: "center",
            }}>
              {error}
            </Alert>
          }
          <TextInput
            label="Никнейм"
            placeholder="Придумайте свой ник"
            autoComplete="username"
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
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
            placeholder="Придумайте пароль"
            autoComplete="new-password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <TextInput
            label="Повторите пароль"
            type="password"
            placeholder="Повторите пароль"
            autoComplete="new-password"
            {...register("passwordRepeat")}
            error={!!errors.passwordRepeat}
            helperText={errors.passwordRepeat?.message}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 1 }}
            disabled={loading}
          >
            {loading ? "Загрузка..." : "Зарегистрироваться"}
          </Button>
          <Typography variant="body1" sx={{ textAlign: "center" }}>
            Уже есть аккаунт?{" "}
            <Link
              component={RouterLink}
              to="/login"
              underline="hover"
              sx={{ fontWeight: 600 }}
            >
              Войти
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </BaseLayout>
  );
};

export default RegisterPage;
