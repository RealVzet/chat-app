import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

interface ThemeCtx {
  theme: Theme;
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: "light", isDark: false, toggle: () => {} });

const LIGHT = {
  "--bg":        "#ffffff",
  "--bg-2":      "#f2f2f7",
  "--bg-card":   "#ffffff",
  "--bg-input":  "#f0f0f5",
  "--text":      "#000000",
  "--text-2":    "#8e8e93",
  "--sep":       "#e5e5ea",
  "--tab-bg":    "rgba(249,249,249,0.94)",
  "--glass":     "rgba(255,255,255,0.97)",
  "--bubble-in": "#f0f0f5",
  "--bubble-in-text": "#000000",
};

const DARK = {
  "--bg":        "#000000",
  "--bg-2":      "#1c1c1e",
  "--bg-card":   "#2c2c2e",
  "--bg-input":  "#1c1c1e",
  "--text":      "#ffffff",
  "--text-2":    "#8e8e93",
  "--sep":       "#38383a",
  "--tab-bg":    "rgba(28,28,30,0.94)",
  "--glass":     "rgba(44,44,46,0.97)",
  "--bubble-in": "#3a3a3c",
  "--bubble-in-text": "#ffffff",
};

function applyVars(vars: Record<string, string>) {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(vars)) {
    root.style.setProperty(k, v);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try { return (localStorage.getItem("theme") as Theme) || "light"; } catch { return "light"; }
  });

  useEffect(() => {
    applyVars(theme === "dark" ? DARK : LIGHT);
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);

  const toggle = () => setTheme(t => t === "light" ? "dark" : "light");

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === "dark", toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }
