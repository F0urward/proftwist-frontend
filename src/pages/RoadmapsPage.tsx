import { Box, Paper, Typography, Stack } from "@mui/material";
import RoadmapCard from "../components/RoadmapCard/RoadmapCard.tsx";
import CategoryList from "../components/CategoryList/CategoryList.tsx";
import BaseLayout from "../components/BaseLayout/BaseLayout.tsx";

const RoadmapsPage = () => {
    return (
        <BaseLayout>
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
                    Roadmaps
                </Typography>
                <Typography variant="body2">
                    Начните свой карьерный путь вместе с нами
                </Typography>
            </Paper>

            <Box
                sx={{
                    width: "100%",
                    maxWidth: 900,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
                    gap: { xs: 2, md: 3 },
                }}
            >
                <CategoryList
                    items={["Все roadmaps", "Веб разработка", "Мобильная разработка", "Аналитика", "Дизайн", "Тестирование", "Безопасность"]}
                    selected={0}
                />

                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                    <Stack spacing={2}>
                        <RoadmapCard title="Backend Beginner" to="/" />
                        <RoadmapCard title="Frontend Beginner" to="/" />
                    </Stack>
                </Paper>
            </Box>
        </BaseLayout>
    );
};

export default RoadmapsPage;