import React from "react";
import useTheme from "../hooks/useTheme";

const baseButton = {
  border: "none",
  boxShadow: "none",
};

function buttonStyle(isActive) {
  return {
    ...baseButton,
    background: isActive ? "var(--secondary)" : "transparent",
    color: isActive ? "var(--primary)" : "var(--text-muted)",
    boxShadow: isActive ? "0 8px 20px -12px rgba(105,166,187,0.6)" : "none",
  };
}

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
        style={buttonStyle(!isDark)}
      >
        <span className="icon" aria-hidden="true">?</span>
        Light
      </button>
      <button
        type="button"
        className="theme-toggle"
        onClick={() => setTheme("dark")}
        aria-pressed={isDark}
        style={buttonStyle(isDark)}
      >
        <span className="icon" aria-hidden="true">?</span>
        Dark
      </button>
    </div>
  );
}
