import { Paper, Typography, Stack, TextField, Button, Link } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
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

    const onChange = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((s) => ({ ...s, [key]: e.target.value }));

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <BaseLayout>
            <TitlePaper
                title="Создайте аккаунт"
                subtitle="Начните свой карьерный путь вместе с нами"
            ></TitlePaper>
            <Paper
                sx={{
                    p: { xs: 3, md: 4 },
                }}
                component="form"
                onSubmit={onSubmit}
            >

                <Stack spacing={3}>
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

                    <Button type="submit" variant="contained" sx={{ mt: 1 }}>
                        Зарегистрироваться
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