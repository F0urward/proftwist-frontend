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

const STORAGE_KEY = "selectedCategoryIndex";

const PersonalRoadmapsPage = () => {
  const [items, setItems] = useState<RoadmapInfo[]>([]);
  const [selected, setSelected] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  const categoryNames = useMemo(
    () => [
      "Все мои roadmaps",
      "Избранное",
      "Созданные roadmaps",
      "Форки",
      "Опубликованные roadmaps",
    ],
    [],
  );

  useEffect(() => {
    const savedIndex = localStorage.getItem(STORAGE_KEY);
    if (savedIndex !== null) {
      setSelected(parseInt(savedIndex, 10));
    }
  }, []);

  const handleSelect = (i: number) => {
    setSelected(i);
    localStorage.setItem(STORAGE_KEY, i.toString());
  };

  useEffect(() => {
    if (selected === -1) return;

    let cancelled = false;

    async function load() {
      try {
        let data: RoadmapInfo[] = [];

        if (selected === 0) {
          // All roadmaps
          data = await roadmapinfoService.getByUser();
          let subscribed: RoadmapInfo[] =
            await roadmapinfoService.getSubscribed();
          data = [...data, ...subscribed];
        } else if (selected === 1) {
          // Saved
          data = await roadmapinfoService.getSubscribed();
        } else if (selected === 2) {
          // Created
          const all = await roadmapinfoService.getByUser();
          data = all.filter(
            (r) =>
              !r.is_public &&
              (!r.referenced_roadmap_info_id ||
                r.referenced_roadmap_info_id === ""),
          );
        } else if (selected === 3) {
          // Forks
          const all = await roadmapinfoService.getByUser();
          data = all.filter(
            (r) =>
              !r.is_public &&
              (r.referenced_roadmap_info_id ||
                r.referenced_roadmap_info_id != ""),
          );
        } else if (selected === 4) {
          // Published
          const all = await roadmapinfoService.getByUser();
          data = all.filter((r) => r.is_public);
        }
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setInitialized(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  return (
    <BaseLayout>
      <TitlePaper
        title="Мои роадмапы"
        subtitle="Изучите свою профессию быстрее вместе с нами"
      >
        <>
          <Button variant="contained" onClick={() => setModalOpen(true)}>
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
          {!items.length && initialized && <EmptyState></EmptyState>}
          <Stack spacing={2}>
            {items.map((roadmap) => (
              <ItemCard
                key={roadmap.id}
                title={roadmap.name}
                description={roadmap.description}
                to={`/roadmaps/${roadmap.id}`}
                state={{ type: "owned", roadmap }}
              />
            ))}
          </Stack>
        </Paper>
      </Box>
    </BaseLayout>
  );
};

export default PersonalRoadmapsPage;
