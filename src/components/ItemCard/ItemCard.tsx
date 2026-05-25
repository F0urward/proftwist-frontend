import { Paper, Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { East } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

type Props = {
    title: string;
    description?: string | undefined;
    to?: string;
    state?: any;
};

const ItemCard = ({ title, description, to = "#", state}: Props) => {
  const theme = useTheme();

  return (
    <Paper
        variant="outlined"
        component={RouterLink}
        to={to}
        state={state}
        style={{ textDecoration: "none" }}
        sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            py: 2,
            borderRadius: 4,
            borderColor: theme.palette.divider,
            transition: "border-color .2s, background-color .2s",
            "&:hover": {
                backgroundColor: theme.palette.action.hover,
                borderColor: theme.palette.primary.main,
            },
            "&:hover .arrow-box": {
                color: theme.palette.primary.main,
            },
        }}
    >
        <Box>
            <Typography variant="body1">{title}</Typography>

            {description && (
            <Typography
                variant="body2"
                sx={{
                    color: "text.secondary",
                }}
            >
                {description}
            </Typography>
            )} 
        </Box>

        <Box 
            className="arrow-box"
            sx={{
                width: 32,
                height: 32,
                color: "text.primary",
                display: "grid",
                placeItems: "center",
            }}
        >
            <East fontSize="small" />
        </Box>
    </Paper>
  );
};

export default ItemCard;
