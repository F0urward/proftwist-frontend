import { Box, Paper, Stack, Button } from "@mui/material";
import ItemCard from "../components/ItemCard/ItemCard.tsx";
import CategoryList from "../components/CategoryList/CategoryList.tsx";
import BaseLayout from "../components/BaseLayout/BaseLayout.tsx";
import TitlePaper from "../components/TitlePaper/TitlePaper.tsx";

import { useNavigate } from "react-router-dom";

const PersonalRoadmapsPage = () => {
    const navigate =useNavigate();
    return (
        <BaseLayout>
            <TitlePaper
                title="Мои Roadmaps"
                subtitle="Изучите свою профессию быстрее вместе с нами"
            >
                <>
                    <Button 
                        variant="contained"
                        onClick={ () => navigate("/")}
                    >
                        Создать свой roadmap
                    </Button>
                </>
            </TitlePaper>

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
                    items={["Все roadmaps", "Сохраненные roadmaps", "Созданные roadmaps"]}
                    selected={0}
                />

                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                    <Stack spacing={2}>
                        <ItemCard title="Мой Backend Beginner" description="Это крутой роадмап" to="/" />
                        <ItemCard title="Мой Frontend Beginner" description="Это крутой роадмап" to="/" />
                    </Stack>
                </Paper>
            </Box>
        </BaseLayout>
    );
};

export default PersonalRoadmapsPage;