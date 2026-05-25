import { createSlice } from "@reduxjs/toolkit";

type ThemeMode = "dark" | "light";

const getInitialMode = (): ThemeMode => {
  try {
    const stored = localStorage.getItem("theme-mode");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable
  }
  return "dark";
};

interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = {
  mode: getInitialMode(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme-mode", state.mode);
      } catch {
        // ignore
      }
    },
    setTheme(state, action) {
      state.mode = action.payload;
      try {
        localStorage.setItem("theme-mode", state.mode);
      } catch {
        // ignore
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
