import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "dzalino:theme";

function readInitialTheme() {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch (err) {
  }
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function persist(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch (err) {
  }
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
      persist(next);
    },
    toggleTheme(state) {
      state.mode = state.mode === "light" ? "dark" : "light";
      persist(state.mode);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
export const selectTheme = (state) => state.theme.mode;
