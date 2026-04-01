/**
 * Shared Theme Toggle Button
 * Cycles through light, dark, and system themes
 * Used in Header, DocsSidebar, and other layout components
 */

import { useState, useEffect } from "react";
import { cn } from "~/lib/utils";
import { useTheme } from "~/components/theme/provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by rendering empty placeholder until mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const themes: Array<"light" | "dark"> = ["light", "dark"];
  const currentIndex = themes.indexOf(theme as "light" | "dark");
  const nextTheme = themes[(currentIndex + 1) % themes.length];

  const icons = {
    light: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
    ),
    dark: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    ),
  };

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      className={cn(
        "inline-flex items-center justify-center w-9 h-9 rounded-md",
        "bg-transparent hover:bg-accent border-0 cursor-pointer text-primary",
        "transition-colors duration-200",
      )}
      aria-label={`Switch to ${nextTheme} theme`}
    >
      {icons[theme as keyof typeof icons] || icons.light}
    </button>
  );
}