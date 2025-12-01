import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { materialsService } from "../../api/material.service";
import { Material } from "../../types/material";

interface AddMaterialModalProps {
  open: boolean;
  onClose: () => void;
  nodeId: string;
  roadmapId: string;
  onSave?: (m: Material) => void;
  notify: (message: string, type?: "success" | "error") => void;
}

const AddMaterialModal = ({
  open,
  onClose,
  nodeId,
  roadmapId,
  onSave,
  notify,
}: AddMaterialModalProps) => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setUrl("");
      setError("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Введите название материала");
      return;
    }
    if (!url.trim()) {
      setError("Введите ссылку");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const created = await materialsService.create(roadmapId, nodeId, {
        name,
        url,
      });
      notify("Материал успешно добавлен!", "success");
      if (onSave) onSave(created);
      onClose();
    } catch (e) {
      notify("Не удалось добавить материал", "error");
      setError("Не удалось добавить материал");
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
        Добавить материал
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          <TextField
            label="Название материала"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Ссылка"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            fullWidth
            required
          />

          {error && (
            <Typography sx={{ color: "red", fontSize: 14 }}>{error}</Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          Добавить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMaterialModal;
