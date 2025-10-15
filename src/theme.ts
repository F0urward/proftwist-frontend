import { createTheme } from "@mui/material";

const colors = {
  accent1: "#BC57FF",
  accent2: "#FF4DCA",
  hover: "#2B1631",
  backgroundDark: "#181818",
  backgroundPaper: "#212121",
  gradientDark: "linear-gradient(90deg, #5C0099 0%, #BE0085 100%)",
  gradientLight: "linear-gradient(90deg, #BC57FF 0%, #FF4DCA 100%)",
  border: "#848484",
  white: "#ffffff",
};

export const theme = createTheme({
  typography: {
    fontFamily: '"Lato", "Inter", sans-serif',
    button: {
      fontSize: "1rem",
      fontWeight: 500,
    },
  },
  palette: {
    background: {
      default: colors.backgroundDark,
      paper: colors.backgroundPaper,
    },
    text: {
      primary: colors.white,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          background: colors.gradientDark,
          border: 0,
          boxShadow: "none",
          textTransform: "none",
          borderRadius: 10,
          "&:hover": {
            background: colors.gradientLight,
            boxShadow: "none",
          },
        },
        text: {
          textTransform: "none",
          color: colors.white,
          borderRadius: 10,
          "&:hover": {
            background: "#733E97",
            boxShadow: "none",
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: colors.backgroundPaper,
          color: colors.white,
          borderRadius: 20,
          width: "100%",
          maxWidth: 900,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 5,
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
          color: colors.white,
          "&.Mui-focused": {
            color: colors.accent1,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.border,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.accent1,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.accent1,
          },
        },
        input: {
          color: colors.white,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: colors.accent1,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          width: "fit-content",
        },
      },
    },
  },
});
