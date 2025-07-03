"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useAuthContext } from "./auth-provider";
import type { Theme } from "@/lib/types";

interface ThemeContextType {
  theme: Theme;
  actualTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
}: ThemeProviderProps) {
  const { user, updateSession } = useAuthContext();
  const [localTheme, setLocalTheme] = useLocalStorage<Theme>(
    storageKey,
    defaultTheme
  );
  const [theme, setThemeState] = useState<Theme>(localTheme);
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  // Sync with user preferences if authenticated
  useEffect(() => {
    if (user?.preferences?.theme && user.preferences.theme !== theme) {
      setThemeState(user.preferences.theme);
      setLocalTheme(user.preferences.theme);
    }
  }, [user?.preferences?.theme, theme, setLocalTheme]);

  // Calculate actual theme (resolve 'system')
  const actualTheme: "light" | "dark" =
    theme === "system" ? (prefersDark ? "dark" : "light") : theme;

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(actualTheme);
  }, [actualTheme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    setLocalTheme(newTheme);

    // Update user preferences if authenticated
    if (user) {
      try {
        const formData = new FormData();
        formData.append("theme", newTheme);

        const response = await fetch("/api/users/preferences", {
          method: "PATCH",
          body: formData,
        });

        if (response.ok) {
          // Update session with new theme
          await updateSession();
        }
      } catch (error) {
        console.error("Failed to update theme preference:", error);
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = actualTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
