"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { getCookie, setCookie, removeCookie } from "~/lib/cookies";

type Theme = "dark" | "light" | "system";
type ResolvedTheme = Exclude<Theme, "system">;

const DEFAULT_THEME = "system";
const THEME_COOKIE_NAME = "vite-ui-theme";
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  defaultTheme: Theme;
  resolvedTheme: ResolvedTheme;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resetTheme: () => void;
};

const ThemeContext = createContext<ThemeProviderState | null>(null);

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  storageKey = THEME_COOKIE_NAME,
}: ThemeProviderProps) {
  const [theme, _setTheme] = useState<Theme>(
    () => (getCookie(storageKey) as Theme) || defaultTheme,
  );

  const resolvedTheme = useMemo((): ResolvedTheme => {
    if (typeof window === "undefined") return "light";
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme as ResolvedTheme;
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (currentResolvedTheme: ResolvedTheme) => {
      root.classList.remove("light", "dark");
      root.classList.add(currentResolvedTheme);
    };

    const handleChange = () => {
      if (theme === "system") {
        applyTheme(resolvedTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    applyTheme(resolvedTheme);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme, resolvedTheme]);

  const setTheme = (newTheme: Theme) => {
    if (typeof window === "undefined") return;
    _setTheme(newTheme);
    setCookie(storageKey, newTheme, THEME_COOKIE_MAX_AGE);
  };

  const resetTheme = () => {
    if (typeof window === "undefined") return;
    removeCookie(storageKey);
    _setTheme(defaultTheme);
  };

  const value = useMemo(
    () => ({
      defaultTheme,
      resolvedTheme,
      theme,
      setTheme,
      resetTheme,
    }),
    [defaultTheme, resolvedTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}