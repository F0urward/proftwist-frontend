import { Box, Paper, Typography, Stack, TextField, Button, Link } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

type Form = {
  email: string;
  password: string;
};

const LoginPage = () => {
    const [form, setForm] = useState<Form>({
        email: "",
        password: "",
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
                    Войдите в аккаунт
                </Typography>
                <Typography variant="body2">
                    Продолжите освоение профессии с нами
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

                    <Button type="submit" variant="contained" size="large" sx={{ mt: 1 }}>
                        Войти в аккаунт
                    </Button>

                    <Typography variant="body2" sx={{ textAlign: "center" }}>
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
        </Box>
    );
};

export default LoginPage;