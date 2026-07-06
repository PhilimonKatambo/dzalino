import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "dzalino:theme";

function readInitialTheme() {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch (err) {
    // ignore storage errors (private mode, etc.)
  }
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

const initialState = {
  mode: readInitialTheme(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action) {
      const next = action.payload;
      if (next !== "light" && next !== "dark") return;
      state.mode = next;
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch (err) {
        // ignore
      }
    },
    toggleTheme(state) {
      state.mode = state.mode === "light" ? "dark" : "light";
      try {
        window.localStorage.setItem(STORAGE_KEY, state.mode);
      } catch (err) {
        // ignore
      }
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
export const selectTheme = (state) => state.theme.mode;
