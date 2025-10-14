import { Alert, Paper, Typography, Stack, Button, Link } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { authService } from "../api/auth.service";
import TitlePaper from "../components/TitlePaper/TitlePaper";
import BaseLayout from "../components/BaseLayout/BaseLayout";
import TextInput from "../components/TextInput/TextInput";

type Form = {
  nickname: string;
  email: string;
  password: string;
  repeatedPassword: string;
};

const RegisterPage = () => {
  const [form, setForm] = useState<Form>({
    nickname: "",
    email: "",
    password: "",
    repeatedPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onChange =
    (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((s) => ({ ...s, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.register({
        username: form.nickname,
        email: form.email,
        password: form.password,
      });

      if (res.status === 201) {
        navigate("/");
        return;
      }
      setError("Registration failed. Please try again.");
    } catch (err: any) {
      console.error("Could not register", err);

      // if backend sends readable message:
      const message =
        err.response?.data?.message ||
        "Ошибка при регистрации. Попробуйте позже.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseLayout>
      <TitlePaper
        title="Создайте аккаунт"
        subtitle="Начните свой карьерный путь вместе с нами"
      />
      <Paper sx={{ p: { xs: 3, md: 4 } }} component="form" onSubmit={onSubmit}>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextInput
            label="Никнейм"
            value={form.nickname}
            onChange={onChange("nickname")}
            placeholder="Придумайте свой ник"
            autoComplete="username"
          />
          <TextInput
            label="Email"
            type="email"
            value={form.email}
            onChange={onChange("email")}
            placeholder="example@email.com"
            autoComplete="email"
          />
          <TextInput
            label="Пароль"
            type="password"
            value={form.password}
            onChange={onChange("password")}
            placeholder="Придумайте пароль"
            autoComplete="new-password"
          />
          <TextInput
            label="Повторите пароль"
            type="password"
            value={form.repeatedPassword}
            onChange={onChange("repeatedPassword")}
            placeholder="Повторите пароль"
            autoComplete="new-password"
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
