import { Snackbar, Alert } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState, useCallback } from "react";

type Severity = "success" | "error" | "info";

export const useNotification = () => {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<Severity>("info");

    const showNotification = useCallback((msg: string, sev: Severity = "info") => {
        setMessage(msg);
        setSeverity(sev);
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => setOpen(false), []);

    const Notification = (
        <Snackbar
            open={open}
            autoHideDuration={3000}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
            <Alert
                severity={severity}
                onClose={handleClose}
                sx={{
                    backgroundColor: severity === "error" ? theme.palette.error.main : theme.palette.primary.main,
                    color: "#fff",
                    "& .MuiAlert-icon": {
                        color: "#fff",
                    },
                    fontSize: "1em",
                    borderRadius: "10px",
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );

    return { showNotification, Notification };
};
