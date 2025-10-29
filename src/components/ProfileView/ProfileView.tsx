import { useRef, useState, ChangeEvent } from "react";
import {
  Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, Stack, Typography, Paper, Divider
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import TextInput from "../TextInput/TextInput";

const ProfileView = () => {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const openDialog = () => {
    setOpen(true);
  };


  const handlePickAvatar = (e: ChangeEvent<HTMLInputElement>) => {
  };

  const handleSave = async () => {
    setOpen(false);
  };

  return (
        <Paper
            variant="outlined"
            sx={{
                width: "40vw",
                minHeight: "80vh",
            }}
        >
            <Box
                sx={{
                    px: 2.5, py: 2.5,
                    pt: 1.25, pb: 1.25,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
            >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, }}>
                    Профиль
                </Typography>
                <Button variant="contained" startIcon={<EditIcon />} onClick={openDialog}>
                    Настройки
                </Button>
            </Box>
            <Divider sx={{ ml: 2.5, mr: 2.5, borderBottom: "1px solid #848484" }} />

            <Box sx={{ p: 3 }}>
                <Grid container spacing={3} alignItems="center">
                    <Avatar
                        src="/static/images/avatar/1.jpg"
                        sx={{
                            width: 96,
                            height: 96,
                            bgcolor: alpha("#BC57FF", 0.15),
                            border: "1px solid rgba(255,255,255,.12)",
                        }}
                    >
                    </Avatar>
                    <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <PersonIcon fontSize="small" />
                            <Typography>Nickname</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <EmailIcon fontSize="small" />
                            <Typography>Email</Typography>
                        </Stack>
                    </Stack>
                </Grid>
            </Box>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Настройки профиля</DialogTitle>
                <DialogContent sx={{ p: 3, pb: 0 }}>
                    <Stack spacing={3}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                                src="/static/images/avatar/1.jpg"
                                sx={{
                                    width: 72, height: 72, fontSize: 24,
                                    bgcolor: alpha("#BC57FF", 0.15),
                                    border: "1px solid rgba(255,255,255,.12)",
                                }}
                            >
                            </Avatar>

                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handlePickAvatar}
                            />
                            <Button
                                variant="text"
                                startIcon={<PhotoCamera />}
                                onClick={() => fileRef.current?.click()}
                            >
                                Загрузить аватар
                            </Button>
                        </Stack>

                        <TextInput
                            label="Ник"
                            value="Текущий никнейм" 
                        />

                        <TextInput
                            label="Почта"
                            type="email"
                            value="Текущий email"
                        />

                        <Divider sx={{ borderColor: "rgba(255,255,255,.08)" }} />
                            
                        <TextInput
                            label="Текущий пароль"
                            type="password"
                        />

                        <TextInput
                            label="Новый пароль"
                            type="password"
                        />

                        <TextInput
                            label="Подтверждение пароля"
                            type="password"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button variant="text" onClick={() => setOpen(false)}>Отмена</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                    >
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default ProfileView;
