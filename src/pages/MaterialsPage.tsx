import { Box, Stack, Paper } from "@mui/material";
import BaseLayout from "../components/BaseLayout/BaseLayout";
import TitlePaper from "../components/TitlePaper/TitlePaper";
import CategoryList from "../components/CategoryList/CategoryList";
import ItemCard from "../components/ItemCard/ItemCard";

const MaterialsPage = () => {
    return (
        <BaseLayout>
            <TitlePaper
                title="Материалы"
                subtitle="Собрали для вас полезные ресурсы для обучения"
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
                    items={["Все профессии", "Веб разработка", "Мобильная разработка", "Аналитика", "Дизайн", "Тестирование", "Безопасность"]}
                    selected={0}
                />

                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                    <Stack spacing={2}>
                        <ItemCard title="Материал 1" description="Это крутой материал" to="https://education.vk.company" />
                        <ItemCard title="Материал 2" description="Это крутой материал" to="https://education.vk.company" />
                    </Stack>
                </Paper>
            </Box>
        </BaseLayout>
    );
};

export default MaterialsPage;