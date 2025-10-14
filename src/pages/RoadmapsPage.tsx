import { Box, Paper, Stack } from "@mui/material";
import ItemCard from "../components/ItemCard/ItemCard.tsx";
import CategoryList from "../components/CategoryList/CategoryList.tsx";
import BaseLayout from "../components/BaseLayout/BaseLayout.tsx";
import TitlePaper from "../components/TitlePaper/TitlePaper.tsx";
import { useEffect, useState, useMemo } from "react";

type Roadmap = {
    id: number;
    title: string;
    category: string;
    description?: string;
}

const RoadmapsPage = () => {
    const [items, setItems] = useState<Roadmap[]>([]);

    useEffect(() => {
        setItems([
            { id: 1, title: "Frontend Developer", category: "Веб разработка", description: "HTML/CSS/JS/React" },
            { id: 2, title: "Data Analyst", category: "Аналитика", description: "SQL, Python, BI" },
            { id: 3, title: "Backend Developer", category: "Веб разработка", description: "Node.js, Databases" },
        ]);
    }, []);

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
                        {items.map((roadmap) => (
                            <ItemCard key={roadmap.id} title={roadmap.title} description={roadmap.description} to={`/roadmaps/${roadmap.id}`} state={{ type: "official" }} />
                        ))}
                    </Stack>
                </Paper>
            </Box>
        </BaseLayout>
    );
};

export default RoadmapsPage;