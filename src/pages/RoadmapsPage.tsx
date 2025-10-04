import { Box, Paper, Typography, Stack } from "@mui/material";
import RoadmapCard from "../components/RoadmapCard/RoadmapCard.tsx";
import CategoryList from "../components/CategoryList/CategoryList.tsx";

const RoadmapsPage = () => {
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
        </Box>
    );
};

export default RoadmapsPage;