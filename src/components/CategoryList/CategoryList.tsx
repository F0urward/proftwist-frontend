import {
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

type Props = {
  items: string[];
  selected?: number;
  onSelect?: (index: number) => void;
};

const CategoryList = ({ items, selected = 0, onSelect }: Props) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 2.5,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ mb: 1.5, textAlign: "center", fontWeight: 700 }}
      >
        Категории
      </Typography>
      <Divider sx={{ mb: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }} />
      <List
        disablePadding
        sx={{
          display: "grid",
          gap: 1,
          overflowY: "auto",
          flex: 1,
          minHeight: 0,
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
        }}
      >
        {items.map((label, i) => (
          <ListItemButton
            key={label}
            selected={i === selected}
            onClick={() => onSelect?.(i)}
            sx={{
              position: "relative",
              borderRadius: 3,
              px: 2,
              "&.Mui-selected": {
                backgroundColor: theme.palette.action.selected,
              },
              "&.Mui-selected:hover": {
                backgroundColor: theme.palette.action.hover,
              },
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
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
