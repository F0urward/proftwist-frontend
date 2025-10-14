import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import RoadmapsDropdown from "../RoadmapsDropdown/RoadmapsDropdown";

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
                to="/roadmaps"
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
                    <RoadmapsDropdown />
                    <Button
                        variant="text"
                        component={RouterLink} 
                        to="/materials" 
                    >
                        Материалы
                    </Button>
                    <Button
                        variant="text"
                        component={RouterLink} 
                        to="/"
                    >
                        Create
                    </Button>
                    <Button 
                        variant="text"
                        component={RouterLink}
                        to="/view"
                    >
                        View
                    </Button>
                </Box>
                
                <Box
                    sx={{
                        display: "flex",
                        gap: 3,
                    }}
                >
                    <Button
                        variant="text"
                        component={RouterLink}
                        to="/login"
                    >
                        Войти
                    </Button>

                    <Button
                        variant="contained"
                        component={RouterLink}
                        to="/signup"
                    >
                        Зарегистрироваться
                    </Button>
                </Box>
            </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
