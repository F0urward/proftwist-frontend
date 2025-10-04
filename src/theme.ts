import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    background: {
      default: "#181818",
      paper: "#212121",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          background: "linear-gradient(90deg, #BC57FF 0%, #FF4DCA 100%)",
          textTransform: "none",
          borderRadius: 10,
        },
      },
    },
  },
});
