import { Box, Paper, Stack, Button } from "@mui/material";
import ItemCard from "../components/ItemCard/ItemCard.tsx";
import CategoryList from "../components/CategoryList/CategoryList.tsx";
import BaseLayout from "../components/BaseLayout/BaseLayout.tsx";
import TitlePaper from "../components/TitlePaper/TitlePaper.tsx";
import CreateRoadmapInfoModal from "../components/CreateRoadmapsinfoModal/CreateRoadmapsinfoModal";
import { roadmapinfoService } from "../api/roadmapinfo.service";
import { RoadmapInfo } from "../types/roadmapinfo";
import EmptyState from "../components/EmptyState/EmptyState.tsx";

import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

const STORAGE_KEY = "selectedCategoryId";

const PersonalRoadmapsPage = () => {
    const [items, setItems] = useState<RoadmapInfo[]>([]);
    const [selected, setSelected] = useState<number>(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const navigate = useNavigate();

    const categoryNames = useMemo(
        () => ["Все roadmaps", "Созданные roadmaps", "Сохранённые roadmaps"],
        []
    );

    const handleSelect = (i: number) => {
        setSelected(i);
        if (i === 0) {
            localStorage.removeItem(STORAGE_KEY);
        } else {
            const id =(categoryNames[i - 1] as any)?.category_id;
            if (id) localStorage.setItem(STORAGE_KEY, id);
        }
    };

    const selectedCategoryId = useMemo(() => {
        if (selected <= 0) return null;
        const idx = selected - 1;
        return idx ?? null;
    }, [selected, categoryNames]);
    
    useEffect(() => {
        if (selected === -1) return;

        let cancelled = false;
        async function load() {
            try {
                const data = await roadmapinfoService.getByUser();
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
                title="Мои Roadmaps"
                subtitle="Изучите свою профессию быстрее вместе с нами"
            >
                <>
                    <Button 
                        variant="contained"
                        onClick={() => setModalOpen(true)}
                    >
                        Создать свой roadmap
                    </Button>
                </>
            </TitlePaper>

            <CreateRoadmapInfoModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            />

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

export default PersonalRoadmapsPage;