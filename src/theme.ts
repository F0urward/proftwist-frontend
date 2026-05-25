import { createTheme, type Theme } from "@mui/material";

interface ThemeColors {
  accent1: string;
  accent2: string;
  hover: string;
  backgroundDark: string;
  backgroundLight: string;
  backgroundPaper: string;
  gradientDark: string;
  gradientLight: string;
  border: string;
  white: string;
  darkText: string;
  tooltipBg: string;
}

const darkColors: ThemeColors = {
  accent1: "#BC57FF",
  accent2: "#FF4DCA",
  hover: "#2B1631",
  backgroundDark: "#181818",
  backgroundLight: "#181818",
  backgroundPaper: "#212121",
  gradientDark: "linear-gradient(90deg, #5C0099 0%, #BE0085 100%)",
  gradientLight: "linear-gradient(90deg, #BC57FF 0%, #FF4DCA 100%)",
  border: "#848484",
  white: "#ffffff",
  darkText: "#ffffff",
  tooltipBg: "#43244cff",
};

const lightColors: ThemeColors = {
  accent1: "#4A2C1B",
  accent2: "#C68E5A",
  hover: "#EDE6DC",
  backgroundDark: "#F5F0EB",
  backgroundLight: "#F5F0EB",
  backgroundPaper: "#FFFFFF",
  gradientDark: "linear-gradient(90deg, #4A2C1B 0%, #C68E5A 100%)",
  gradientLight: "linear-gradient(90deg, #8B5E3C 0%, #D4A76A 100%)",
  border: "#D4C4B0",
  white: "#FFFFFF",
  darkText: "#2C1810",
  tooltipBg: "#3E2216",
};

const baseTypography = {
  fontFamily: '"Lato", "Inter", sans-serif',
  button: {
    fontSize: "1rem",
    fontWeight: 500,
  },
} as const;

export const createThemeByMode = (mode: "dark" | "light"): Theme => {
  const isDark = mode === "dark";
  const c = isDark ? darkColors : lightColors;

  return createTheme({
    typography: baseTypography,
    palette: {
      mode,
      primary: {
        main: c.accent1,
      },
      secondary: {
        main: c.accent2,
      },
      background: {
        default: c.backgroundDark,
        paper: c.backgroundPaper,
      },
      text: {
        primary: c.darkText,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            "&.active": {
              background: c.gradientDark,
              color: c.white,
            },
            borderRadius: 10,
            lineHeight: 1.25,
            paddingTop: 8,
            paddingBottom: 8,
          },
          contained: {
            background: c.gradientDark,
            border: 0,
            color: c.white,
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 10,
            boxShadow: "none",
            "&:hover": {
              background: c.gradientLight,
              boxShadow: "none",
            },
            "&.Mui-disabled": {
              color: isDark
                ? "rgba(255,255,255,0.45)"
                : "rgba(44,24,16,0.38)",
            },
          },
          containedPrimary: {
            color: c.white,
            "&.Mui-disabled": {
              color: isDark
                ? "rgba(255,255,255,0.45)"
                : "rgba(44,24,16,0.38)",
            },
          },
          text: {
            textTransform: "none",
            color: isDark ? c.white : c.darkText,
            borderRadius: 10,
            "&:hover": {
              background: isDark ? "#733E97" : c.hover,
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
            backgroundColor: c.backgroundPaper,
            color: c.darkText,
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
            boxShadow: isDark
              ? "0 4px 12px rgba(0,0,0,0.08)"
              : "0 2px 8px rgba(0,0,0,0.06)",
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
            color: c.darkText,
            "&.Mui-focused": {
              color: c.accent1,
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: c.border,
              borderRadius: 10,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: c.accent1,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: c.accent1,
            },
          },
          input: {
            color: c.darkText,
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: c.accent1,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            width: "fit-content",
            mt: 1,
            bgcolor: c.backgroundPaper,
            color: c.darkText,
            border: `1px solid ${c.border}`,
          },
          list: {
            py: 0.5,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: c.hover,
            },
            "&.Mui-selected:hover": {
              backgroundColor: c.hover,
            },
          },
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
            backgroundColor: c.tooltipBg,
            color: "#fff",
            fontSize: "0.8rem",
            fontWeight: 500,
            borderRadius: 10,
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: isDark
              ? "0 4px 12px rgba(0,0,0,0.3)"
              : "0 4px 12px rgba(0,0,0,0.15)",
          },
          arrow: {
            color: c.tooltipBg,
          },
        },
      },
    },
  });
};
