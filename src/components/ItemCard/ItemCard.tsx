import { Paper, Box, Typography } from "@mui/material";
import { East } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

type Props = {
    title: string;
    description?: string | undefined;
    to?: string;
    state?: any;
};

const ItemCard = ({ title, description, to = "#", state}: Props) => {
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
            borderColor: "#848484",
            transition: "border-color .2s, background-color .2s",
            "&:hover": {
                backgroundColor: "#2B1631",
                borderColor: "#BC57FF",
            },
            "&:hover .arrow-box": {
                color: "#BC57FF",
            },
        }}
    >
        <Box>
            <Typography variant="body1">{title}</Typography>

            {description && (
            <Typography
                variant="body2"
                sx={{
                    color: "#BFBFBF",
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
                color: "#ffffff",
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
