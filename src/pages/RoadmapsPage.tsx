import { Box, Paper, Stack } from "@mui/material";
import ItemCard from "../components/ItemCard/ItemCard.tsx";
import CategoryList from "../components/CategoryList/CategoryList.tsx";
import BaseLayout from "../components/BaseLayout/BaseLayout.tsx";
import TitlePaper from "../components/TitlePaper/TitlePaper.tsx";

const RoadmapsPage = () => {
    return (
        <BaseLayout>
            <TitlePaper
                title="Roadmaps"
                subtitle="Начните свой карьерный путь вместе с нами"
            ></TitlePaper>

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
                        <ItemCard title="Backend Beginner" description="Это крутой роадмап" to="/" />
                        <ItemCard title="Frontend Beginner" description="Это крутой роадмап" to="/" />
                    </Stack>
                </Paper>
            </Box>
        </BaseLayout>
    );
};

export default RoadmapsPage;