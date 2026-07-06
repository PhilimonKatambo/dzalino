import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectTheme, setTheme } from "../store/themeSlice";

/**
 * Returns the active theme mode and a setter. Also keeps the
 * `<html data-theme="…">` attribute in sync so CSS variables can
 * react to the change.
 */
export default function useTheme() {
  const mode = useSelector(selectTheme);
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = mode;
    }
  }, [mode]);

  return {
    mode,
    isDark: mode === "dark",
    setTheme: (next) => dispatch(setTheme(next)),
  };
}
