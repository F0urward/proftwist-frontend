import { Box, Paper, Stack } from "@mui/material";
import ItemCard from "../components/ItemCard/ItemCard.tsx";
import CategoryList from "../components/CategoryList/CategoryList.tsx";
import BaseLayout from "../components/BaseLayout/BaseLayout.tsx";
import TitlePaper from "../components/TitlePaper/TitlePaper.tsx";
import { useEffect, useState, useMemo } from "react";
import { categoryService } from "../api/category.service.ts";
import { roadmapinfoService } from "../api/roadmapinfo.service.ts";
import { Category } from "../types/category.ts";
import { RoadmapInfo } from "../types/roadmapinfo.ts";
import EmptyState from "../components/EmptyState/EmptyState.tsx";

const STORAGE_KEY = "selectedCategoryId";

const RoadmapsPage = () => {
    const [items, setItems] = useState<RoadmapInfo[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [selected, setSelected] = useState(-1);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        categoryService.getCategories().then(setCategories).catch((e) => setCategories([]));
    }, []);

    useEffect(() => {
        if (categories.length === 0) {
            setSelected(0);
            return;
        }

        const savedId = localStorage.getItem(STORAGE_KEY);
        if (!savedId) {
            setSelected(0);
            return;
        }

        const idx = categories.findIndex((c) => ((c as any).category_id) === savedId);
        if (idx >= 0) setSelected(idx + 1); 
    }, [categories]);

    const categoryNames = useMemo(
        () => ["Мои roadmaps", ...categories.map((c) => c.name)],
        [categories]
    );

    const selectedCategoryId = useMemo(() => {
        if (selected <= 0) return null;
        const idx = selected - 1;
        return categories[idx]?.category_id ?? null;
    }, [selected, categories]);

    const handleSelect = (i: number) => {
        setSelected(i);
        if (i === 0) {
            localStorage.removeItem(STORAGE_KEY);
        } else {
            const id =(categories[i - 1] as any)?.category_id;
            if (id) localStorage.setItem(STORAGE_KEY, id);
        }
    };

    useEffect(() => {
        if (selected === -1) return;

        let cancelled = false;
        async function load() {
            try {
                const data = selectedCategoryId
                ? await roadmapinfoService.getByCategory(selectedCategoryId)
                : await roadmapinfoService.getAllRoadmapsInfo();
                if (!cancelled) setItems(data);
            } catch (e) {
                console.error("Load roadmapsinfo failed:", e);
                if (!cancelled) setItems([]);
            } finally {
                if (!cancelled) {
                    setInitialized(true);
                }
            }
        }
        load();
        return () => { cancelled = true; };
    }, [selectedCategoryId, selected]);

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
                    items={categoryNames}
                    selected={selected}
                    onSelect={handleSelect}
                />

                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                    {!items.length && initialized &&
                        <EmptyState></EmptyState>
                    }
                    <Stack spacing={2}>
                        {items.map((roadmap) => (
                            <ItemCard 
                                key={roadmap.id} 
                                title={roadmap.name} 
                                description={roadmap.description} 
                                to={`/roadmaps/${roadmap.id}`} 
                                state={{ type: "official", roadmap }}
                            />
                        ))}
                    </Stack>
                </Paper>
            </Box>
        </BaseLayout>
    );
};

export default RoadmapsPage;