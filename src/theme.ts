import { createTheme } from "@mui/material";

export const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          background: "linear-gradient(90deg, #BC57FF 0%, #FF4DCA 100%)",
        },
      },
    },
  },
});
