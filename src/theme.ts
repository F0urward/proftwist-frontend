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
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: "#212121",
          color: "#ffffff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 900,
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          borderRadius: 0,
          border: 0,
          width: "100%",
          margin: 0,
          maxWidth: "100%",
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: "#ffffff",
          "&.Mui-focused": {
            color: "#BC57FF",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#848484",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#BC57FF",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#BC57FF",
          },
        },
        input: {
          color: "#ffffff",
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#BC57FF",
        }
      }
    }
  },
});
