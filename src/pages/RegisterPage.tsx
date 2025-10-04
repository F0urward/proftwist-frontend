import { Box, Paper, Typography, Stack, TextField, Button, Link } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

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

    const onChange = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((s) => ({ ...s, [key]: e.target.value }));

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <Box
            sx={{
                minHeight: { xs: "calc(100svh - 56px)", sm: "calc(100svh - 64px)" },
                bgcolor: "background.default",
                overflow: "hidden",
                backgroundImage: "url(/assets/bg-glow.svg), url(/assets/bg-glow.svg)",
                backgroundRepeat: "no-repeat, no-repeat",
                backgroundPosition: "right -25vw top -50vh, left -25vw bottom -50vh",
                backgroundSize: "clamp(520px, 65vw, 1000px), clamp(520px, 65vw, 1000px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: { xs: 3, md: 4 },
                py: { xs: 3, md: 4 },
                px: 2,
            }}
        >
            <Paper
                sx={{
                    p: { xs: 3, md: 4 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                }}
            >
                <Typography
                    variant="h3"
                    sx={{
                        fontFamily: '"TDAText"',
                        fontWeight: 900,
                        letterSpacing: 0.5,
                        mb: 1.5,
                        backgroundImage: "linear-gradient(90deg, #BC57FF, #FF4DCA)",
                        backgroundClip: "text",
                        color: "transparent",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Создайте аккаунт
                </Typography>
                <Typography variant="body2">
                    Начните свой карьерный путь вместе с нами
                </Typography>
            </Paper>
            <Paper
                sx={{
                    p: { xs: 3, md: 4 },
                }}
                component="form"
                onSubmit={onSubmit}
            >

                <Stack spacing={3}>
                    <TextField
                        label="Никнейм"
                        value={form.nickname}
                        onChange={onChange("nickname")}
                        placeholder="Придумайте ник"
                    />
                    <TextField
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={onChange("email")}
                        placeholder="name@email.com"
                    />
                    <TextField
                        label="Пароль"
                        type="password"
                        value={form.password}
                        onChange={onChange("password")}
                        placeholder="Минимум 6 символов"
                    />
                    <TextField
                        label="Повторите пароль"
                        type="password"
                        value={form.repeatedPassword}
                        onChange={onChange("repeatedPassword")}
                    />

                    <Button type="submit" variant="contained" size="large" sx={{ mt: 1 }}>
                        Зарегистрироваться
                    </Button>

                    <Typography variant="body2" sx={{ textAlign: "center" }}>
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
        </Box>
    );
};

export default RegisterPage;