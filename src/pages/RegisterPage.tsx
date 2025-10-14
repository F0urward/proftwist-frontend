import { Alert, Paper, Typography, Stack, Button, Link } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import TitlePaper from "../components/TitlePaper/TitlePaper";
import BaseLayout from "../components/BaseLayout/BaseLayout";
import TextInput from "../components/TextInput/TextInput";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RootState, useAppDispatch, useAppSelector } from "../store";
import { signup } from "../store/slices/authSlice";

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Nickname must be at least 3 characters")
      .max(20, "Nickname must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Nickname can only contain letters, numbers, and underscores",
      )
      .nonempty("Nickname is required"),
    email: z.email("Invalid email address").nonempty("Email is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      )
      .nonempty("Password is required"),
    passwordRepeat: z.string().nonempty("Please confirm your password"),
  })
  .refine((data) => data.password === data.passwordRepeat, {
    message: "Passwords must match",
    path: ["passwordRepeat"], // Attach error to passwordRepeat field
  });

export type SignupFormData = z.infer<typeof registerSchema>;

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
          {error && <Alert severity="error">{error}</Alert>}
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
