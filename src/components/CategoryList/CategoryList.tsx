import { Paper, Typography, List, ListItemButton, ListItemText, Divider } from "@mui/material";

type Props = {
    items: string[];
    selected?: number;
};

const CategoryList = ({ items, selected = 0 }: Props) => {
    return (
        <Paper variant="outlined" sx={{ p: 2.5, width: "100%" }}>
            <Typography
                variant="subtitle1"
                sx={{ mb: 1.5, textAlign: "center", fontWeight: 700, }}
            >
                Категории
            </Typography>
            <Divider sx={{ mb: 1.5, borderBottom: "1px solid #ffffff" }} />
            <List disablePadding sx={{ display: "grid", gap: 1 }}>
                {items.map((label, i) => (
                <ListItemButton 
                    key={label}
                    selected={i === selected}
                    sx={{
                        position: "relative",
                        borderRadius: 4,
                        px: 2,
                        "&.Mui-selected": {
                            backgroundColor: "#2B1631",
                        },
                        "&.Mui-selected:hover": {
                            backgroundColor: "rgba(188, 87, 255, 0.25)",
                        },
                    }}
                >
                    <ListItemText primary={label} />
                </ListItemButton>
                ))}
            </List>
        </Paper>
    );
};

export default CategoryList;
