import * as React from "react";
import { createContext } from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | null>(null);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "colorMode",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    const stored = localStorage.getItem(storageKey);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
    return defaultTheme;
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = getSystemTheme();
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(getSystemTheme());
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme: (newTheme: Theme) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(storageKey, newTheme);
        setTheme(newTheme);
      },
    }),
    [theme, storageKey],
  );

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeProviderContext);
  // Return default values if used outside provider (SSR safety)
  if (!context) {
    return {
      theme: "system" as Theme,
      setTheme: () => undefined,
    };
  }
  return context;
}