import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";
const STORAGE_KEY = "admin-theme";

export function useTheme(): [ThemeMode, (m: ThemeMode) => void] {
  const getInitial = (): ThemeMode => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved) return saved;
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    return mq?.matches ? "dark" : "light";
  };

  const [mode, setMode] = useState<ThemeMode>(getInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  return [mode, setMode];
}
