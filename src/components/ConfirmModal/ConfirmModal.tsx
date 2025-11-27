import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "error" | "warning" | "info" | "success";
  onConfirm: () => void;
  onClose: () => void;
};

const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = "Подтверждение",
  message = "Вы уверены, что хотите выполнить это действие?",
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  confirmColor = "error",
}: ConfirmModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: "center" }}>{title}</DialogTitle>

      <DialogContent>
        {typeof message === "string" ? (
          <Typography>{message}</Typography>
        ) : (
          message
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{cancelText}</Button>

        <Button variant="contained" color={confirmColor} onClick={onConfirm}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmModal;
