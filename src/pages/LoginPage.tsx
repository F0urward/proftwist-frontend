import { Paper, Typography, Stack, Button, Link } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import TitlePaper from "../components/TitlePaper/TitlePaper";
import BaseLayout from "../components/BaseLayout/BaseLayout";
import TextInput from "../components/TextInput/TextInput";

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
                onSubmit={onSubmit}
            >

                <Stack spacing={3}>
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
                        placeholder="Введите ваш пароль"
                        autoComplete="current-password"
                    />

                    <Button type="submit" variant="contained" sx={{ mt: 1 }}>
                        Войти в аккаунт
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