import { Box, Paper, Stack, Button, SwipeableDrawer } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
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
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const navigate = useNavigate();

  const categoryNames = useMemo(
    () => [
      "Все мои роадмапы",
      "Избранное",
      "Созданные роадмапы",
      "Форки",
      "Опубликованные роадмапы",
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
            Создать свой роадмап
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
        <Box
          sx={{
            display: { xs: "none", md: "block" },
          }}
        >
          <CategoryList
            items={categoryNames}
            selected={selected}
            onSelect={handleSelect}
          />
        </Box>

        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<TuneIcon />}
            onClick={() => setCategoriesOpen(true)}
            sx={{
              justifyContent: "center",
              borderRadius: 3,
              color: "#BC57FF",
              borderColor: "#BC57FF",
            }}
          >
            Категории
          </Button>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, md: 3 },
            display: "flex",
            flexDirection: "column",
            minHeight: "300px",
            height: { xs: "calc((100dvh - 395px))", md: "calc(100vh - 380px)" },
            "@media (max-width: 426px)": { height: "calc((100dvh - 450px))" },
          }}
        >
          <Box
            sx={{
              height: "100%",
              pt: 2,
              mx: "-10px",
              position: "relative",
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                width: "10px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: "999px",
                backgroundClip: "content-box",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "rgba(255,255,255,0.9)",
              },
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.7) transparent",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0px, black 24px, black calc(100% - 32px), transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, transparent 0px, black 24px, black calc(100% - 32px), transparent 100%)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          >
            <Box sx={{ px: "10px", height: "100%" }}>
              {!items.length && initialized && <EmptyState></EmptyState>}
              <Stack spacing={2}>
                {items.map((roadmap) => (
                  <ItemCard
                    key={roadmap.id}
                    title={roadmap.name}
                    description={roadmap.description}
                    to={`/roadmaps/${roadmap.id}`}
                    state={{ type: "owned", roadmap, from: "personal" }}
                  />
                ))}
                <Box sx={{ height: 5 }} />
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Box>
      <SwipeableDrawer
        anchor="bottom"
        open={categoriesOpen}
        onOpen={() => setCategoriesOpen(true)}
        onClose={() => setCategoriesOpen(false)}
        disableSwipeToOpen
        slotProps={{
          paper: {
            sx: {
              height: "60vh",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              pt: 1,
            },
          },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.3)",
            mx: "auto",
            mb: 1.5,
          }}
        />

        <Box sx={{ height: "100%", width: "100%", border: "none" }}>
          <CategoryList
            items={categoryNames}
            selected={selected}
            onSelect={(i) => {
              handleSelect(i);
              setCategoriesOpen(false);
            }}
          />
        </Box>
      </SwipeableDrawer>
    </BaseLayout>
  );
};

export default PersonalRoadmapsPage;
