import { Box, Typography, Button } from "@mui/material";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";

type Props = {
  title?: string;
  subtitle?: string;
};

const EmptyState = ({ title = "Ничего не найдено", subtitle = "Попробуйте выбрать другую категорию" }: Props) => {
  return (
    <Box
        sx={{
            height: 1,
            width: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transform: "translateY(-6%)"
        }}
    >
        <SearchOffRoundedIcon sx={{ fontSize: 56 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
        </Typography>
        {subtitle && (
            <Typography variant="body1">
                {subtitle}
            </Typography>
        )}
    </Box>
  );
}

export default EmptyState;
