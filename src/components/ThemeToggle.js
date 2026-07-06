import React from "react";
import useTheme from "../hooks/useTheme";

export default function ThemeToggle() {
  const { isDark, setTheme } = useTheme();

  return (
    <div
      className="theme-toggle"
      role="group"
      aria-label="Theme switcher"
      style={{ padding: 4, gap: 0 }}
    >
      <button
        type="button"
        className="theme-toggle"
        onClick={() => setTheme("light")}
        aria-pressed={!isDark}
        style={{
          border: "none",
          background: !isDark ? "var(--secondary)" : "transparent",
          color: !isDark ? "var(--primary)" : "var(--text-muted)",
          boxShadow: !isDark ? "0 8px 20px -12px rgba(105,166,187,0.6)" : "none",
        }}
      >
        <span className="icon" aria-hidden="true">☀</span>
        Light
      </button>
      <button
        type="button"
        className="theme-toggle"
        onClick={() => setTheme("dark")}
        aria-pressed={isDark}
        style={{
          border: "none",
          background: isDark ? "var(--secondary)" : "transparent",
          color: isDark ? "var(--primary)" : "var(--text-muted)",
          boxShadow: isDark ? "0 8px 20px -12px rgba(105,166,187,0.6)" : "none",
        }}
      >
        <span className="icon" aria-hidden="true">☾</span>
        Dark
      </button>
    </div>
  );
}
