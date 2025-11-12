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
        root: {
          "&.active": {
            background: colors.gradientDark,
            color: colors.white,
          },
        },
        contained: {
          background: colors.gradientDark,
          border: 0,
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 10,
          boxShadow: "none",
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
            borderRadius: 10,
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
          mt: 1,
          bgcolor: "#212121",
          color: "#fff",
          border: "1px solid #444",
        },
        list: {
          py: 0.5,
        }
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&:hover": { backgroundColor: "#2B1631" },
          "&.Mui-selected:hover": {
            backgroundColor: "#2B1631"
          },
        }
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "24px",
          paddingTop: 0,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#43244cff",
          color: "#fff",
          fontSize: "0.8rem",
          fontWeight: 500,
          borderRadius: 10,
          padding: "8px 12px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        },
        arrow: {
          color: "#43244cff",
        },
      },
    },
  },
});
