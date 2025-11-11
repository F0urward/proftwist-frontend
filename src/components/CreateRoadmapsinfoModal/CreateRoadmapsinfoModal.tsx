import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, MenuItem, FormControlLabel, Switch } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { roadmapinfoService } from "../../api/roadmapinfo.service.ts";
import { categoryService } from "../../api/category.service.ts";
import { Category } from "../../types/category.ts";
import TextInput from "../TextInput/TextInput";

interface Props {
    open: boolean;
    onClose: () => void;
}

const CreateRoadmapInfoModal = ({ open, onClose }: Props) => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
        categoryService
            .getCategories()
            .then((res) => setCategories(res))
            .catch(() => setCategories([]));
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("Введите название");
            return;
        }
        if (!categoryId) {
            setError("Выберите категорию");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const newInfo = await roadmapinfoService.create({
                category_id: categoryId,
                name,
                description,
                is_public: false,
            });

            onClose();

            const roadmapId = newInfo.roadmap_id ?? null;

            navigate(`/roadmaps/${roadmapId}/edit`, {
                state: { roadmapInfo: newInfo },
            });
        } catch (e) {
            console.error("Ошибка при создании roadmap:", e);
            setError("Не удалось создать roadmap");
        } finally {
            setLoading(false);
        }
    };

  return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle 
                variant="h4"
                sx={{
                    alignSelf: "center",
                    fontFamily: '"TDAText", "Lato", sans-serif',
                    fontWeight: 900,
                    backgroundImage: "linear-gradient(90deg, #BC57FF, #FF4DCA)",
                    backgroundClip: "text",
                    color: "transparent",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}
            >
                Создать новый roadmap
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3}>
                    <TextInput
                        select
                        label="Категория"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                    >
                        {categories.map((cat) => (
                        <MenuItem key={cat.category_id} value={cat.category_id}>
                            {cat.name}
                        </MenuItem>
                        ))}
                    </TextInput>

                    <TextField
                        label="Название"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        required
                    />

                    <TextField
                        label="Описание"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                    />

                    {error && <div style={{ color: "red", fontSize: 14 }}>{error}</div>}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Создание..." : "Создать"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateRoadmapInfoModal;
