import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

type NavbarProps = {
  isAuth: boolean;
};

const Navbar = ({ isAuth }: NavbarProps) => {
  return (
    <AppBar 
        position="static" 
        sx={{ 
            bgcolor: "background.paper",
        }}
    >
        <Toolbar 
            sx={{
                display: "flex", 
                justifyContent: "space-between",
                px: { xs: 3, md: 20 }, 
            }}
        >

            <Typography
                variant="h6"
                component={RouterLink}
                to="/"
                sx={{ 
                    fontFamily: '"TDAText"',
                    textDecoration: "none", 
                    fontWeight: 700,
                    backgroundImage: "linear-gradient(90deg, #BC57FF 0%, #FF4DCA 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    WebkitTextFillColor: "transparent",
                }}
            >
                ProfTwist
            </Typography>

            {!isAuth && (
                <>
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        gap: 3,
                    }}
                >
                    <Button color="inherit" component={RouterLink} to="/" sx={{ textTransform: "none" }}>
                        Create
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/view" sx={{ textTransform: "none" }}>
                        View
                    </Button>
                </Box>

                <Button
                    variant="contained"
                    component={RouterLink}
                    to="/signup"
                >
                    Зарегистрироваться
                </Button>
            </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
