import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, MenuItem, FormControlLabel, Switch } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { roadmapinfoService } from "../../api/roadmapinfo.service.ts";
import { categoryService } from "../../api/category.service.ts";
import { Category } from "../../types/category.ts";
import TextInput from "../TextInput/TextInput";
import { RoadmapInfo } from "../../types/roadmapinfo.ts";

interface Props {
    open: boolean;
    onClose: () => void;
    mode?: "create" | "edit";
    roadmapInfo?: RoadmapInfo | null;
    onSave?: (updated: RoadmapInfo) => void;
}

const CreateRoadmapInfoModal = ({ open, onClose, mode = "create", roadmapInfo, onSave}: Props) => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const isEdit = mode === "edit";

    useEffect(() => {
        if (open) {
        categoryService
            .getCategories()
            .then((res) => setCategories(res))
            .catch(() => setCategories([]));
        }
    }, [open]);

    useEffect(() => {
        if (mode === "edit" && roadmapInfo) {
            setName(roadmapInfo.name);
            setDescription(roadmapInfo.description || "");
            setCategoryId(roadmapInfo.category_id || "");
        } else {
            setName("");
            setDescription("");
            setCategoryId("");
        }
    }, [roadmapInfo, mode]);

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
            if (mode === "create") {
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
            } else if (mode === "edit") {
                await roadmapinfoService.update(roadmapInfo.id, {
                    name,
                    description,
                    is_public: false,
                });
                const updated = await roadmapinfoService.getById(roadmapInfo.id);
                if (onSave && updated) {
                    onSave(updated);
                }
                onClose();
            }
        } catch (e) {
            console.error("Ошибка при создании roadmap:", e);
            if (isEdit) {
                setError("Не удалось сохранить изменения о roadmap");
            } else {
                setError("Не удалось создать roadmap");
            }
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
                    textAlign: "center",
                    fontFamily: '"TDAText", "Lato", sans-serif',
                    fontWeight: 900,
                    backgroundImage: "linear-gradient(90deg, #BC57FF, #FF4DCA)",
                    backgroundClip: "text",
                    color: "transparent",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}
            >
                { isEdit ? "Редактировать информацию о roadmap" : "Создать новый roadmap" }
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3}>
                    { !isEdit && 
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
                    }

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
                    {isEdit ? "Сохранить" : "Создать"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateRoadmapInfoModal;
